"""Sign-up, sign-in and the signed-in user (US-003, US-004).

POST /auth/register creates an account from a valid, unused email and a password
meeting the stated rules; the password is stored only as a bcrypt hash and the
account is usable immediately, with no email-verification step (AC-006, AC-009).
A taken email is refused with EMAIL_ALREADY_REGISTERED (AC-007); a malformed email
or a too-short password is refused by the request model itself, as a 422 (AC-008).

POST /auth/login verifies the email and password of an existing, active account and
starts a session, returning an opaque token (AC-010). A wrong password or an unknown
email is refused the same way, as INVALID_CREDENTIALS, so neither field is named as
the one that was wrong and no session is started (AC-011, NFR-005).

GET /auth/me returns the signed-in user for a still-valid session token, and
SESSION_EXPIRED once that token is missing, revoked, or its session has expired from
inactivity (AC-012, NFR-002).

POST /auth/logout revokes the current session token server-side, so it can no longer
be used for an action that requires login (AC-013, NFR-003). It is refused the same
way as any other call behind a session, as SESSION_EXPIRED, when the token is already
missing, revoked, or expired.
"""

from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.auth import (
    USER_ROLE,
    authenticate,
    create_session,
    current_token,
    current_user,
    ensure_user,
    find_user,
    revoke_session,
)
from app.database import get_db
from app.errors import EMAIL_ALREADY_REGISTERED, INVALID_CREDENTIALS, SESSION_EXPIRED
from app.models import User
from app.schemas import (
    CurrentUser,
    LoginRequest,
    LoginResponse,
    RegisterRequest,
    RegisterResponse,
)

router = APIRouter(prefix="/auth", tags=["Auth"])


@router.post(
    "/register",
    status_code=201,
    responses={
        EMAIL_ALREADY_REGISTERED.status: {"description": EMAIL_ALREADY_REGISTERED.message},
    },
)
def register(
    body: RegisterRequest, session: Annotated[Session, Depends(get_db)]
) -> RegisterResponse:
    email = body.email.strip()
    created = ensure_user(session, email=email, password=body.password, role=USER_ROLE)
    if not created:
        raise HTTPException(EMAIL_ALREADY_REGISTERED.status, EMAIL_ALREADY_REGISTERED.message)
    session.commit()
    user = find_user(session, email)
    assert user is not None  # just created, in the same session
    return RegisterResponse(id=user.id, email=user.email)


@router.post(
    "/login",
    responses={INVALID_CREDENTIALS.status: {"description": INVALID_CREDENTIALS.message}},
)
def login(body: LoginRequest, session: Annotated[Session, Depends(get_db)]) -> LoginResponse:
    """Verifies the credentials and starts a session (AC-010); a wrong password or an
    unknown email is refused the same generic way, and no session is started
    (AC-011, NFR-005)."""
    user = authenticate(session, body.email, body.password)
    if user is None:
        raise HTTPException(INVALID_CREDENTIALS.status, INVALID_CREDENTIALS.message)
    token = create_session(session, user)
    session.commit()
    return LoginResponse(token=token)


@router.get(
    "/me",
    responses={SESSION_EXPIRED.status: {"description": SESSION_EXPIRED.message}},
)
def me(user: Annotated[User, Depends(current_user)]) -> CurrentUser:
    """The signed-in user for a still-active session token (AC-012, NFR-002)."""
    return CurrentUser(id=user.id, email=user.email, role=user.role)


@router.post(
    "/logout",
    status_code=204,
    responses={SESSION_EXPIRED.status: {"description": SESSION_EXPIRED.message}},
)
def logout(
    user: Annotated[User, Depends(current_user)],
    token: Annotated[str, Depends(current_token)],
    session: Annotated[Session, Depends(get_db)],
) -> None:
    """Revokes the current session token server-side (AC-013, NFR-003)."""
    revoke_session(session, token)
    session.commit()
