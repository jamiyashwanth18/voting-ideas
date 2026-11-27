"""Sign-in, proved on the test database. Part of the scaffold's test kit.

The `auth_client` fixture (tests/conftest.py) signs in the same way, so a failure here
explains a failure in every test that uses it.
"""

import secrets
import time
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


def test_tc012_successful_login_with_correct_credentials(client: TestClient) -> None:
    """AC-010: a registered, active account logs in and receives an opaque session
    token."""
    email = "alice@example.com"
    password = "Str0ngP@ss1"

    register_response = client.post("/auth/register", json={"email": email, "password": password})

    assert register_response.status_code == 201

    login_response = client.post("/auth/login", json={"email": email, "password": password})

    assert login_response.status_code == 200
    assert login_response.json()["token"]


def test_tc014_login_refused_for_a_deactivated_account(
    client: TestClient, admin_client: TestClient
) -> None:
    """AC-010: a deactivated account cannot log in even with the correct password,
    and no session token is returned.

    The admin in the approved case (admin@example.com / AdminP@ss1) is replaced here
    by the kit's `admin_client` fixture, which signs in as a freshly made admin through
    the app itself: the kit never lets a test hard-code another account's credentials.
    """
    email = "bob@example.com"
    password = "Str0ngP@ss1"

    register_response = client.post("/auth/register", json={"email": email, "password": password})

    assert register_response.status_code == 201
    bob_id = register_response.json()["id"]

    deactivate_response = admin_client.post(f"/admin/users/{bob_id}/deactivate")

    assert deactivate_response.status_code == 200

    login_response = client.post("/auth/login", json={"email": email, "password": password})

    assert login_response.status_code != 200
    assert "token" not in login_response.json()


def test_tc016_login_refused_with_wrong_password(client: TestClient) -> None:
    """AC-011, NFR-005: the correct email with the wrong password is refused with the
    contract's generic message, and no session token is returned."""
    email = "dave@example.com"

    register_response = client.post(
        "/auth/register", json={"email": email, "password": "Str0ngP@ss1"}
    )

    assert register_response.status_code == 201

    login_response = client.post("/auth/login", json={"email": email, "password": "WrongPass1!"})

    assert login_response.status_code == 401
    body = login_response.json()
    assert "token" not in body
    assert body.get("detail") == "Incorrect email or password."


def test_tc017_login_refused_with_unknown_email(client: TestClient) -> None:
    """AC-011, NFR-005: an unregistered email is refused with the same generic
    message as a wrong password, and no session token is returned."""
    login_response = client.post(
        "/auth/login", json={"email": "ghost@example.com", "password": "AnyPass1!"}
    )

    assert login_response.status_code == 401
    body = login_response.json()
    assert "token" not in body
    assert body.get("detail") == "Incorrect email or password."


def test_tc020_expired_session_rejected_on_a_protected_call(client: TestClient) -> None:
    """AC-012, NFR-002: a session left inactive beyond the configured expiry period
    is rejected on the next call that needs login, and no user data is returned.

    The test environment is preconditioned to a 2 second inactivity expiry; this test
    only waits past it and reuses the token, as the case's steps say.
    """
    email = "frank@example.com"
    password = "Str0ngP@ss1"

    register_response = client.post("/auth/register", json={"email": email, "password": password})

    assert register_response.status_code == 201

    login_response = client.post("/auth/login", json={"email": email, "password": password})

    assert login_response.status_code == 200
    token = login_response.json()["token"]

    time.sleep(3)

    me_response = client.get("/auth/me", headers={"Authorization": f"Bearer {token}"})

    assert me_response.status_code == 401
