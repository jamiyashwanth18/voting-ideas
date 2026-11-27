"""Unit tests for the logic behind POST /auth/login and GET /auth/me (US-004):
credential verification, the generic failure message, and session-expiry handling.
"""

import secrets
from datetime import UTC, datetime, timedelta
from uuid import uuid4

import pytest
from fastapi import HTTPException
from fastapi.security import HTTPAuthorizationCredentials
from sqlalchemy.orm import Session

from app.auth import (
    SESSION_INACTIVITY_PERIOD,
    USER_ROLE,
    current_user,
    ensure_user,
)
from app.errors import INVALID_CREDENTIALS, SESSION_EXPIRED
from app.models import UserSession
from app.routers.auth import login, me
from app.schemas import LoginRequest


def _email() -> str:
    return f"login-{uuid4().hex[:12]}@example.com"


def _bearer(token: str) -> HTTPAuthorizationCredentials:
    return HTTPAuthorizationCredentials(scheme="Bearer", credentials=token)


def _register(db_session: Session, *, email: str, password: str) -> None:
    ensure_user(db_session, email=email, password=password, role=USER_ROLE)


def test_ac010_correct_credentials_log_in_and_start_a_session(db_session: Session) -> None:
    email = _email()
    password = secrets.token_urlsafe()
    _register(db_session, email=email, password=password)

    response = login(LoginRequest(email=email, password=password), db_session)

    assert response.token
    assert db_session.query(UserSession).count() == 1


def test_ac010_the_token_resolves_back_to_the_signed_in_user(db_session: Session) -> None:
    email = _email()
    password = secrets.token_urlsafe()
    _register(db_session, email=email, password=password)
    response = login(LoginRequest(email=email, password=password), db_session)

    user = current_user(_bearer(response.token), db_session)

    assert user.email == email
    assert me(user).email == email


def test_ac011_an_unknown_email_is_refused_with_the_generic_message(db_session: Session) -> None:
    with pytest.raises(HTTPException) as excinfo:
        login(LoginRequest(email=_email(), password=secrets.token_urlsafe()), db_session)

    assert excinfo.value.status_code == INVALID_CREDENTIALS.status
    assert excinfo.value.detail == INVALID_CREDENTIALS.message


def test_ac011_an_incorrect_password_is_refused_with_the_same_generic_message(
    db_session: Session,
) -> None:
    email = _email()
    _register(db_session, email=email, password=secrets.token_urlsafe())

    with pytest.raises(HTTPException) as excinfo:
        login(LoginRequest(email=email, password=secrets.token_urlsafe()), db_session)

    assert excinfo.value.status_code == INVALID_CREDENTIALS.status
    assert excinfo.value.detail == INVALID_CREDENTIALS.message


def test_ac011_a_refused_login_starts_no_session(db_session: Session) -> None:
    email = _email()
    _register(db_session, email=email, password=secrets.token_urlsafe())

    with pytest.raises(HTTPException):
        login(LoginRequest(email=email, password=secrets.token_urlsafe()), db_session)

    assert db_session.query(UserSession).count() == 0


def test_ac012_a_session_past_its_inactivity_period_is_rejected(db_session: Session) -> None:
    email = _email()
    password = secrets.token_urlsafe()
    _register(db_session, email=email, password=password)
    response = login(LoginRequest(email=email, password=password), db_session)
    record = db_session.query(UserSession).one()
    record.expires_at = datetime.now(UTC) - timedelta(seconds=1)
    db_session.flush()

    with pytest.raises(HTTPException) as excinfo:
        current_user(_bearer(response.token), db_session)

    assert excinfo.value.status_code == SESSION_EXPIRED.status
    assert excinfo.value.detail == SESSION_EXPIRED.message


def test_ac012_a_still_active_session_has_its_expiry_pushed_forward(db_session: Session) -> None:
    email = _email()
    password = secrets.token_urlsafe()
    _register(db_session, email=email, password=password)
    response = login(LoginRequest(email=email, password=password), db_session)
    record = db_session.query(UserSession).one()
    record.expires_at = datetime.now(UTC) + timedelta(seconds=1)
    db_session.flush()

    current_user(_bearer(response.token), db_session)

    db_session.refresh(record)
    assert record.expires_at > datetime.now(UTC) + SESSION_INACTIVITY_PERIOD - timedelta(seconds=5)


def test_ac012_a_missing_token_is_rejected_as_an_expired_session(db_session: Session) -> None:
    with pytest.raises(HTTPException) as excinfo:
        current_user(None, db_session)

    assert excinfo.value.status_code == SESSION_EXPIRED.status
    assert excinfo.value.detail == SESSION_EXPIRED.message


def test_ac012_an_unknown_token_is_rejected_as_an_expired_session(db_session: Session) -> None:
    with pytest.raises(HTTPException) as excinfo:
        current_user(_bearer(secrets.token_urlsafe(32)), db_session)

    assert excinfo.value.status_code == SESSION_EXPIRED.status
