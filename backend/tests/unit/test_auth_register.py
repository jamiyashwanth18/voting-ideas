"""Unit tests for the registration logic behind POST /auth/register (US-003)."""

import secrets
from uuid import uuid4

import pytest
from fastapi import HTTPException
from pydantic import ValidationError
from sqlalchemy.orm import Session

from app.auth import USER_ROLE, LoginRequest, find_user, login, verify_password
from app.errors import EMAIL_ALREADY_REGISTERED
from app.models import User
from app.routers.auth import register
from app.schemas import RegisterRequest


def _email() -> str:
    return f"register-{uuid4().hex[:12]}@example.com"


def test_ac006_creates_an_account_with_a_bcrypt_hashed_password(db_session: Session) -> None:
    email = _email()
    password = secrets.token_urlsafe(12)

    result = register(RegisterRequest(email=email, password=password), db_session)

    assert result.email == email
    assert result.id

    user = find_user(db_session, email)
    assert user is not None
    assert user.role == USER_ROLE
    # Only a hash is stored, never the plain-text password.
    assert user.password_hash != password
    assert user.password_hash.startswith("$2")  # bcrypt's own prefix
    assert verify_password(password, user.password_hash)


def test_ac006_the_new_account_can_log_in(db_session: Session) -> None:
    email = _email()
    password = secrets.token_urlsafe(12)
    register(RegisterRequest(email=email, password=password), db_session)

    response = login(LoginRequest(email=email, password=password), db_session)

    assert response.token


def test_ac007_rejects_an_already_registered_email(db_session: Session) -> None:
    email = _email()
    register(RegisterRequest(email=email, password=secrets.token_urlsafe(12)), db_session)

    with pytest.raises(HTTPException) as excinfo:
        register(RegisterRequest(email=email, password=secrets.token_urlsafe(12)), db_session)

    assert excinfo.value.status_code == EMAIL_ALREADY_REGISTERED.status
    assert excinfo.value.detail == EMAIL_ALREADY_REGISTERED.message


def test_ac007_no_duplicate_account_is_created(db_session: Session) -> None:
    email = _email()
    register(RegisterRequest(email=email, password=secrets.token_urlsafe(12)), db_session)

    with pytest.raises(HTTPException):
        register(RegisterRequest(email=email, password=secrets.token_urlsafe(12)), db_session)

    matches = db_session.query(User).filter(User.email == email).all()
    assert len(matches) == 1


def test_ac008_a_malformed_email_is_rejected_before_any_handler_runs() -> None:
    with pytest.raises(ValidationError):
        RegisterRequest(email="not-an-email", password=secrets.token_urlsafe(12))


def test_ac008_a_too_short_password_is_rejected_before_any_handler_runs() -> None:
    with pytest.raises(ValidationError):
        RegisterRequest(email=_email(), password="short")


def test_ac009_the_account_is_usable_immediately_with_no_verification_step(
    db_session: Session,
) -> None:
    email = _email()
    password = secrets.token_urlsafe(12)

    register(RegisterRequest(email=email, password=password), db_session)
    user = find_user(db_session, email)

    # No "verified" flag, no pending state: the row created is already a usable account.
    assert user is not None
    assert login(LoginRequest(email=email, password=password), db_session).token
