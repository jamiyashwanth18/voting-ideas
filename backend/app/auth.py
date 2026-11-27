"""Sign-in: an email and a password in, a bearer token out, a session that remembers it.

Part of the scaffold's test kit, so the seed script, the signed-in test client and the
smoke check have a real login from the first commit. The frontend and the API are on
different origins once deployed, so the token travels in the response body and comes back
as `Authorization: Bearer <token>`, never as a cookie.

A session is a row in `sessions` (app/models.py), not a signed claim: the opaque token
handed back from /auth/login resolves to a row whose `expires_at` every verified request
pushes forward by another SESSION_INACTIVITY_PERIOD (AC-012, NFR-002). A session nothing
has used within that period is treated as gone, and whatever needed it is refused and
told to sign in again -- the same SESSION_EXPIRED a missing or unknown token gets, so a
caller learns nothing about why.
"""

import hashlib
import os
import secrets
from datetime import UTC, datetime, timedelta
from typing import Annotated, Any
from uuid import uuid4

import bcrypt
from fastapi import Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api_model import ApiModel
from app.database import get_db
from app.errors import INVALID_CREDENTIALS, SESSION_EXPIRED
from app.models import User, UserSession

ADMIN_ROLE = "admin"
USER_ROLE = "user"

# How long a session survives without activity (AC-012, NFR-002). No work item sets a
# number, so this is a sane default a deployment can override without a code change.
SESSION_INACTIVITY_MINUTES = int(os.getenv("SESSION_INACTIVITY_MINUTES", "30"))
SESSION_INACTIVITY_PERIOD = timedelta(minutes=SESSION_INACTIVITY_MINUTES)

_bearer = HTTPBearer(auto_error=False)
# The users table may come from the approved data model, so its key is read, not assumed:
# an integer key is made by the database, a text key here.
_KEY_COLUMN = User.__mapper__.primary_key[0]
_KEY = User.__mapper__.get_property_by_column(_KEY_COLUMN).key


class LoginRequest(ApiModel):
    email: str
    password: str


class LoginResponse(ApiModel):
    # "token", not "access_token": one word reads the same in camelCase, and it is a name
    # the platform's smoke check looks for.
    token: str


class CurrentUser(ApiModel):
    id: str
    email: str
    role: str


def _now() -> datetime:
    return datetime.now(UTC)


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()


def verify_password(password: str, hashed: str) -> bool:
    try:
        return bcrypt.checkpw(password.encode(), hashed.encode())
    except ValueError:  # not a bcrypt hash
        return False


def find_user(session: Session, email: str) -> User | None:
    return session.scalars(select(User).where(User.email == email)).first()


def ensure_user(session: Session, *, email: str, password: str, role: str) -> bool:
    """Create the user unless one with this email exists. True when it was created."""
    if find_user(session, email) is not None:
        return False
    values: dict[str, Any] = {
        "email": email,
        "password_hash": hash_password(password),
        "role": role,
    }
    if _KEY_COLUMN.type.python_type is str:
        values[_KEY] = str(uuid4())
    session.add(User(**values))
    session.flush()
    return True


def authenticate(session: Session, email: str, password: str) -> User | None:
    """The user this email and password belong to, or None when either is wrong.

    Returns the same "found nothing" result whether the email is unknown or the password
    is wrong, so the caller can never learn which one it was (AC-011, NFR-005).
    """
    user = find_user(session, email.strip())
    if user is None or not verify_password(password, user.password_hash or ""):
        return None
    return user


def _hash_token(token: str) -> str:
    """A fast, one-way digest of the opaque token: the only form kept at rest."""
    return hashlib.sha256(token.encode()).hexdigest()


def create_session(session: Session, user: User) -> str:
    """Starts a session for `user` and returns its opaque bearer token (AC-010)."""
    token = secrets.token_urlsafe(32)
    session.add(
        UserSession(
            id=str(uuid4()),
            user_id=getattr(user, _KEY),
            token_hash=_hash_token(token),
            expires_at=_now() + SESSION_INACTIVITY_PERIOD,
        )
    )
    session.flush()
    return token


def login(body: LoginRequest, session: Session) -> LoginResponse:
    """Verifies the credentials and starts a session, or refuses generically (AC-010,
    AC-011, NFR-005). Kept for the test kit's own direct calls; app/routers/auth.py's
    route does the same thing with the API's own request and response models.
    """
    user = authenticate(session, body.email, body.password)
    if user is None:
        raise HTTPException(INVALID_CREDENTIALS.status, INVALID_CREDENTIALS.message)
    token = create_session(session, user)
    session.commit()
    return LoginResponse(token=token)


def current_user(
    credentials: Annotated[HTTPAuthorizationCredentials | None, Depends(_bearer)],
    session: Annotated[Session, Depends(get_db)],
) -> User:
    """The signed-in user for a still-active session token (AC-012, NFR-002).

    A missing token, one that resolves to no session, and one whose session has already
    expired from inactivity are all refused the same way, as SESSION_EXPIRED. Reaching
    this point at all is activity, so a session found still valid has its expiry pushed
    another SESSION_INACTIVITY_PERIOD into the future: a session in steady use never
    expires, and an idle one expires exactly that long after its last use.
    """
    refused = HTTPException(SESSION_EXPIRED.status, SESSION_EXPIRED.message)
    if credentials is None:
        raise refused
    record = session.scalars(
        select(UserSession).where(UserSession.token_hash == _hash_token(credentials.credentials))
    ).first()
    if record is None or record.expires_at < _now():
        raise refused
    user = session.get(User, record.user_id)
    if user is None:
        raise refused
    record.expires_at = _now() + SESSION_INACTIVITY_PERIOD
    session.commit()
    return user


def me(user: User) -> CurrentUser:
    return CurrentUser(id=str(getattr(user, _KEY)), email=user.email, role=user.role)


def current_token(
    credentials: Annotated[HTTPAuthorizationCredentials | None, Depends(_bearer)],
) -> str:
    """The raw bearer token of the current request, or SESSION_EXPIRED when it is
    missing. Used alongside `current_user` by routes that need the token itself, such
    as POST /auth/logout, which must revoke this one session and no other.
    """
    if credentials is None:
        raise HTTPException(SESSION_EXPIRED.status, SESSION_EXPIRED.message)
    return credentials.credentials


def revoke_session(session: Session, token: str) -> None:
    """Ends the session this token belongs to (AC-013, NFR-003).

    Deletes the matching row in `sessions` outright rather than merely expiring it: once
    revoked, the token resolves to no session at all, so `current_user` refuses it the
    same way it refuses any other token it does not recognise.
    """
    session.query(UserSession).filter(UserSession.token_hash == _hash_token(token)).delete()
    session.flush()
