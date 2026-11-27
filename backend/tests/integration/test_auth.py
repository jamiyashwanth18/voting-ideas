"""Sign-in, proved on the test database. Part of the scaffold's test kit.

The `auth_client` fixture (tests/conftest.py) signs in the same way, so a failure here
explains a failure in every test that uses it.
"""

import secrets
from uuid import uuid4

from fastapi.testclient import TestClient
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.auth import USER_ROLE, ensure_user
from app.seed import seed


def test_a_signed_in_user_reads_their_profile(auth_client: TestClient) -> None:
    response = auth_client.get("/auth/me")

    assert response.status_code == 200
    assert response.json()["role"] == USER_ROLE


def test_without_a_token_the_profile_is_refused(client: TestClient) -> None:
    assert client.get("/auth/me").status_code == 401


def _email() -> str:
    """A new address per test: the database may already hold users the app seeded."""
    return f"kit-{uuid4().hex[:12]}@example.com"


def test_a_wrong_password_is_refused(client: TestClient, db_session: Session) -> None:
    email = _email()
    ensure_user(db_session, email=email, password=secrets.token_urlsafe(), role=USER_ROLE)

    response = client.post(
        "/auth/login", json={"email": email, "password": secrets.token_urlsafe()}
    )

    assert response.status_code == 401


def test_the_seed_makes_its_users_once(db_session: Session) -> None:
    settings = {
        "BOOTSTRAP_ADMIN_EMAIL": _email(),
        "BOOTSTRAP_ADMIN_PASSWORD": secrets.token_urlsafe(),
        "SMOKE_TEST_EMAIL": _email(),
        "SMOKE_TEST_PASSWORD": secrets.token_urlsafe(),
    }

    assert seed(db_session, settings) == 2
    assert seed(db_session, settings) == 0


def test_tc022_register_with_valid_unused_email_and_compliant_password(
    client: TestClient, db_session: Session
) -> None:
    """AC-006: a valid registration creates an account, logs in, and the stored
    record holds only a hash -- never the plaintext password -- anywhere."""
    email = "dana.price@example.com"
    password = "Sunshine8!"

    register_response = client.post("/auth/register", json={"email": email, "password": password})

    assert register_response.status_code == 201
    assert register_response.json()["email"] == email
    assert password not in register_response.text

    login_response = client.post("/auth/login", json={"email": email, "password": password})

    assert login_response.status_code == 200
    assert login_response.json()["token"]

    row = (
        db_session.execute(text("SELECT * FROM users WHERE email = :email"), {"email": email})
        .mappings()
        .first()
    )

    assert row is not None
    stored_strings = [value for value in row.values() if isinstance(value, str)]
    assert password not in stored_strings
    assert any(value.startswith("$2") for value in stored_strings)


def test_tc024_reject_registration_when_the_email_already_has_an_account(
    client: TestClient, db_session: Session
) -> None:
    """AC-007: registering again with an email already in use is rejected, and no
    duplicate account is created."""
    email = "mo.khan@example.com"
    ensure_user(db_session, email=email, password=secrets.token_urlsafe(), role=USER_ROLE)

    response = client.post("/auth/register", json={"email": email, "password": "Riverside9!"})

    assert response.status_code == 409

    login_response = client.post("/auth/login", json={"email": email, "password": "Riverside9!"})

    assert login_response.status_code == 401


def test_tc026_reject_registration_with_a_malformed_email(client: TestClient) -> None:
    """AC-008: a malformed email is rejected with a validation message, and no
    account is created."""
    email = "not-an-email"
    password = "Hillside7!"

    response = client.post("/auth/register", json={"email": email, "password": password})

    assert response.status_code == 422
    detail = response.json()["detail"]
    assert any("email" in str(error["loc"]) for error in detail)

    login_response = client.post("/auth/login", json={"email": email, "password": password})

    assert login_response.status_code == 401


def test_tc027_reject_registration_with_a_password_that_fails_the_rules(
    client: TestClient,
) -> None:
    """AC-008: a password that does not meet the stated rules is rejected with a
    validation message, and no account is created."""
    email = "owen.gray@example.com"
    password = "abc123"

    response = client.post("/auth/register", json={"email": email, "password": password})

    assert response.status_code == 422
    detail = response.json()["detail"]
    assert any("password" in str(error["loc"]) for error in detail)

    login_response = client.post("/auth/login", json={"email": email, "password": password})

    assert login_response.status_code == 401


def test_tc030_new_account_is_usable_immediately_with_no_verification_step(
    client: TestClient,
) -> None:
    """AC-009: a freshly created account logs in and reaches /auth/me right away,
    with no email-verification step in the way."""
    email = "zoe.bell@example.com"
    password = "Falcon123!"

    register_response = client.post("/auth/register", json={"email": email, "password": password})

    assert register_response.status_code == 201

    login_response = client.post("/auth/login", json={"email": email, "password": password})

    assert login_response.status_code == 200
    token = login_response.json()["token"]

    me_response = client.get("/auth/me", headers={"Authorization": f"Bearer {token}"})

    assert me_response.status_code == 200
    assert me_response.json()["email"] == email
