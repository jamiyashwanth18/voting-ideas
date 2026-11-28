"""Integration tests for GET /ideas: ranked listing, tie-break stability, and the
empty board (US-001).

GET /ideas is public and read-only; this sprint ships no endpoint to create an idea
or cast an upvote, so each test seeds the rows it needs directly in the database,
through the fields the public contract (IdeaRead in the API spec) names, then
asserts only on the public API's response.
"""

import secrets
from uuid import uuid4

from fastapi.testclient import TestClient
from sqlalchemy import text
from sqlalchemy.orm import Session


def _make_idea(db_session: Session, *, title: str, description: str, upvote_count: int) -> str:
    idea_id = str(uuid4())
    db_session.execute(
        text(
            "INSERT INTO ideas (id, title, description, upvote_count) "
            "VALUES (:id, :title, :description, :upvote_count)"
        ),
        {
            "id": idea_id,
            "title": title,
            "description": description,
            "upvote_count": upvote_count,
        },
    )
    db_session.commit()
    return idea_id


def test_tc006_list_ideas_ordered_by_upvotes_highest_first(
    client: TestClient, db_session: Session
) -> None:
    _make_idea(
        db_session, title="Mobile app", description="A mobile app for the board", upvote_count=3
    )
    _make_idea(
        db_session,
        title="Dark mode for the board",
        description="Add a dark theme",
        upvote_count=42,
    )
    _make_idea(
        db_session, title="Faster search", description="Speed up the search", upvote_count=15
    )

    response = client.get("/ideas")

    assert response.status_code == 200
    body = response.json()
    assert [item["title"] for item in body] == [
        "Dark mode for the board",
        "Faster search",
        "Mobile app",
    ]
    assert [item["upvoteCount"] for item in body] == [42, 15, 3]
    for item in body:
        assert "title" in item
        assert "description" in item
        assert "upvoteCount" in item


def test_tc008_tied_ideas_keep_stable_order_across_repeated_calls(
    client: TestClient, db_session: Session
) -> None:
    _make_idea(
        db_session, title="Dark theme", description="Add a dark theme option", upvote_count=8
    )
    _make_idea(
        db_session, title="Export to CSV", description="Export the board as CSV", upvote_count=8
    )

    first = client.get("/ideas")
    second = client.get("/ideas")

    assert first.status_code == 200
    assert second.status_code == 200
    first_order = [item["title"] for item in first.json()]
    second_order = [item["title"] for item in second.json()]
    assert set(first_order) == {"Dark theme", "Export to CSV"}
    assert first_order == second_order


def test_tc010_empty_list_returned_when_no_ideas_exist(client: TestClient) -> None:
    response = client.get("/ideas")

    assert response.status_code == 200
    assert response.json() == []


# --- POST /ideas (US-006) ----------------------------------------------------------
#
# The public contract (IdeaRead, in the API spec) carries no author field, so
# attribution (AC-014) is checked the only way it can be from a black-box test: by
# reading the `ideas.author_id` column the case's own "attributed to <email>" wording
# asks for, through `db_session`, and comparing it to the id of the user who registered
# with that email. Every other assertion goes through the public API only.


def _register_and_login(client: TestClient, *, email: str) -> tuple[str, str]:
    """Registers a fresh account and logs it in. Returns (user_id, token)."""
    password = secrets.token_urlsafe()

    register_response = client.post("/auth/register", json={"email": email, "password": password})
    assert register_response.status_code == 201, register_response.text
    user_id = register_response.json()["id"]

    login_response = client.post("/auth/login", json={"email": email, "password": password})
    assert login_response.status_code == 200, login_response.text
    token = login_response.json()["token"]

    return user_id, token


def test_tc043_create_idea_with_valid_title_and_description(
    client: TestClient, db_session: Session
) -> None:
    """AC-014: a logged-in user's valid idea is created, attributed to them, starts
    at zero upvotes, and appears in the public idea list."""
    email = "alice@example.com"
    title = "Dark mode for the board"
    description = "Add a dark theme toggle to the idea board"

    alice_id, token = _register_and_login(client, email=email)

    create_response = client.post(
        "/ideas",
        json={"title": title, "description": description},
        headers={"Authorization": f"Bearer {token}"},
    )

    assert create_response.status_code == 201, create_response.text
    created = create_response.json()
    assert created["title"] == title
    assert created["description"] == description
    assert created["upvoteCount"] == 0

    idea_row = (
        db_session.execute(
            text("SELECT author_id FROM ideas WHERE title = :title"), {"title": title}
        )
        .mappings()
        .first()
    )
    assert idea_row is not None
    assert idea_row["author_id"] == alice_id

    list_response = client.get("/ideas")

    assert list_response.status_code == 200
    matches = [item for item in list_response.json() if item["title"] == title]
    assert len(matches) == 1
    assert matches[0]["description"] == description
    assert matches[0]["upvoteCount"] == 0


def test_tc045_reject_idea_with_empty_title(client: TestClient) -> None:
    """AC-015: an idea submitted with an empty title is rejected with a validation
    error, and no idea is created."""
    description = "A valid description text"
    _, token = _register_and_login(client, email="bob@example.com")

    create_response = client.post(
        "/ideas",
        json={"title": "", "description": description},
        headers={"Authorization": f"Bearer {token}"},
    )

    assert create_response.status_code == 422

    list_response = client.get("/ideas")

    assert list_response.status_code == 200
    assert all(item["description"] != description for item in list_response.json())


def test_tc046_reject_idea_with_empty_description(client: TestClient) -> None:
    """AC-015: an idea submitted with an empty description is rejected with a
    validation error, and no idea is created."""
    title = "New sorting option"
    _, token = _register_and_login(client, email="carl@example.com")

    create_response = client.post(
        "/ideas",
        json={"title": title, "description": ""},
        headers={"Authorization": f"Bearer {token}"},
    )

    assert create_response.status_code == 422

    list_response = client.get("/ideas")

    assert list_response.status_code == 200
    assert all(item["title"] != title for item in list_response.json())


def test_tc047_reject_idea_exceeding_allowed_length_with_over_length_title(
    client: TestClient,
) -> None:
    """AC-015: an idea with a title over the allowed length limit is rejected with a
    validation error, and no idea is created."""
    title = "a" * 300
    description = "A short valid description"
    _, token = _register_and_login(client, email="dana@example.com")

    create_response = client.post(
        "/ideas",
        json={"title": title, "description": description},
        headers={"Authorization": f"Bearer {token}"},
    )

    assert create_response.status_code == 422

    list_response = client.get("/ideas")

    assert list_response.status_code == 200
    assert all(item["description"] != description for item in list_response.json())


def test_tc048_reject_idea_exceeding_allowed_length_with_over_length_description(
    client: TestClient,
) -> None:
    """AC-015: an idea with a valid title but a description over the allowed length
    limit is rejected with a validation error, and no idea is created."""
    title = "A short valid title"
    description = "a" * 2000
    _, token = _register_and_login(client, email="gina@example.com")

    create_response = client.post(
        "/ideas",
        json={"title": title, "description": description},
        headers={"Authorization": f"Bearer {token}"},
    )

    assert create_response.status_code == 422

    list_response = client.get("/ideas")

    assert list_response.status_code == 200
    assert all(item["title"] != title for item in list_response.json())


def test_tc052_reject_idea_creation_without_a_session(client: TestClient) -> None:
    """AC-016: a visitor with no session token is refused when submitting an idea,
    and no idea is created."""
    title = "Unauthorized idea"

    create_response = client.post(
        "/ideas",
        json={"title": title, "description": "Should not be created"},
    )

    assert create_response.status_code == 401

    list_response = client.get("/ideas")

    assert list_response.status_code == 200
    assert all(item["title"] != title for item in list_response.json())


# --- PATCH /ideas/{id} (US-007) ----------------------------------------------------


def _create_idea(client: TestClient, *, token: str, title: str, description: str) -> str:
    create_response = client.post(
        "/ideas",
        json={"title": title, "description": description},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert create_response.status_code == 201, create_response.text
    return create_response.json()["id"]


def test_tc054_author_edits_idea_with_valid_changes(client: TestClient) -> None:
    """AC-017: the author can update their idea's title and description, and the
    change is reflected in the public list."""
    original_title = "Dark mode for the board"
    original_description = "Add a dark theme option"
    new_title = "Dark mode for the board (updated)"
    new_description = "Add a dark theme toggle in settings"

    _, token = _register_and_login(client, email="alice@example.com")
    idea_id = _create_idea(
        client, token=token, title=original_title, description=original_description
    )

    patch_response = client.patch(
        f"/ideas/{idea_id}",
        json={"title": new_title, "description": new_description},
        headers={"Authorization": f"Bearer {token}"},
    )

    assert patch_response.status_code == 200, patch_response.text
    patched = patch_response.json()
    assert patched["title"] == new_title
    assert patched["description"] == new_description

    list_response = client.get("/ideas")

    assert list_response.status_code == 200
    matches = [item for item in list_response.json() if item["title"] == new_title]
    assert len(matches) == 1
    assert matches[0]["description"] == new_description


def test_tc056_non_author_edit_attempt_is_refused(client: TestClient) -> None:
    """AC-018/NFR-006: a logged-in user who is not the author cannot edit another
    user's idea, and the idea is left unchanged."""
    original_title = "Dark mode for the board"
    original_description = "Add a dark theme option"

    _, ada_token = _register_and_login(client, email="ada@example.com")
    idea_id = _create_idea(
        client, token=ada_token, title=original_title, description=original_description
    )

    _, bob_token = _register_and_login(client, email="bob@example.com")

    patch_response = client.patch(
        f"/ideas/{idea_id}",
        json={"title": "Hacked title", "description": "Hacked description"},
        headers={"Authorization": f"Bearer {bob_token}"},
    )

    assert patch_response.status_code == 403

    list_response = client.get("/ideas")

    assert list_response.status_code == 200
    matches = [item for item in list_response.json() if item["title"] == original_title]
    assert len(matches) == 1
    assert matches[0]["description"] == original_description


def test_tc058_edit_rejected_when_title_is_empty(client: TestClient) -> None:
    """AC-019: an empty title is rejected with a validation message, and the idea
    is left unchanged."""
    original_title = "Shared whiteboard mode"
    original_description = "Allow multiple people to edit the same board"

    _, token = _register_and_login(client, email="carol@example.com")
    idea_id = _create_idea(
        client, token=token, title=original_title, description=original_description
    )

    patch_response = client.patch(
        f"/ideas/{idea_id}",
        json={"title": "", "description": original_description},
        headers={"Authorization": f"Bearer {token}"},
    )

    assert patch_response.status_code == 400

    list_response = client.get("/ideas")

    assert list_response.status_code == 200
    matches = [item for item in list_response.json() if item["title"] == original_title]
    assert len(matches) == 1
    assert matches[0]["description"] == original_description


def test_tc059_edit_rejected_when_description_exceeds_allowed_length(
    client: TestClient,
) -> None:
    """AC-019: a description over the allowed length is rejected with a validation
    message, and the idea is left unchanged."""
    original_title = "Offline mode"
    original_description = "Let users browse ideas without internet"
    over_length_description = "A" * 5000

    _, token = _register_and_login(client, email="dave@example.com")
    idea_id = _create_idea(
        client, token=token, title=original_title, description=original_description
    )

    patch_response = client.patch(
        f"/ideas/{idea_id}",
        json={"title": original_title, "description": over_length_description},
        headers={"Authorization": f"Bearer {token}"},
    )

    assert patch_response.status_code == 400

    list_response = client.get("/ideas")

    assert list_response.status_code == 200
    matches = [item for item in list_response.json() if item["title"] == original_title]
    assert len(matches) == 1
    assert matches[0]["description"] == original_description


def test_tc062_edit_rejected_when_description_is_empty(client: TestClient) -> None:
    """AC-019: an empty description is rejected with a validation message, and the
    idea is left unchanged."""
    original_title = "Mobile app"
    original_description = "Build a companion mobile app"

    _, token = _register_and_login(client, email="erin@example.com")
    idea_id = _create_idea(
        client, token=token, title=original_title, description=original_description
    )

    patch_response = client.patch(
        f"/ideas/{idea_id}",
        json={"title": "Mobile app v2", "description": ""},
        headers={"Authorization": f"Bearer {token}"},
    )

    assert patch_response.status_code == 400

    list_response = client.get("/ideas")

    assert list_response.status_code == 200
    matches = [item for item in list_response.json() if item["title"] == original_title]
    assert len(matches) == 1
    assert matches[0]["description"] == original_description


def test_tc063_edit_rejected_when_title_exceeds_allowed_length(client: TestClient) -> None:
    """AC-019: a title over the allowed length is rejected with a validation
    message, and the idea is left unchanged."""
    original_title = "Keyboard shortcuts"
    original_description = "Add shortcuts for common actions"
    over_length_title = "B" * 5000

    _, token = _register_and_login(client, email="frank@example.com")
    idea_id = _create_idea(
        client, token=token, title=original_title, description=original_description
    )

    patch_response = client.patch(
        f"/ideas/{idea_id}",
        json={"title": over_length_title, "description": original_description},
        headers={"Authorization": f"Bearer {token}"},
    )

    assert patch_response.status_code == 400

    list_response = client.get("/ideas")

    assert list_response.status_code == 200
    matches = [item for item in list_response.json() if item["title"] == original_title]
    assert len(matches) == 1
    assert matches[0]["description"] == original_description
