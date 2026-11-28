"""Integration tests for POST /ideas/{id}/vote (US-009).

Covers a first upvote increasing the count and ranking (AC-022), repeat upvote
calls by the same user never recording more than one vote (AC-023, NFR-008), and
an unauthenticated caller being refused the vote (AC-024). Each test registers and
logs in its own user through the public API, then asserts only on the public
/ideas and /ideas/{id}/vote responses.
"""

import secrets

from fastapi.testclient import TestClient


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


def _create_idea(client: TestClient, *, token: str, title: str, description: str) -> str:
    create_response = client.post(
        "/ideas",
        json={"title": title, "description": description},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert create_response.status_code == 201, create_response.text
    created = create_response.json()
    assert created["upvoteCount"] == 0
    return created["id"]


def test_tc066_logged_in_user_upvotes_idea_for_the_first_time(client: TestClient) -> None:
    """AC-022: a user's first upvote on an idea increases its count by one, is
    recorded for that user, and is reflected in the public ranked list."""
    title = "Dark mode for the board"
    description = "Add dark mode to the board"

    _, token = _register_and_login(client, email="voter1@example.com")
    idea_id = _create_idea(client, token=token, title=title, description=description)

    vote_response = client.post(
        f"/ideas/{idea_id}/vote",
        headers={"Authorization": f"Bearer {token}"},
    )

    assert vote_response.status_code == 200, vote_response.text
    voted = vote_response.json()
    assert voted["voted"] is True
    assert voted["voteCount"] == 1

    list_response = client.get("/ideas")

    assert list_response.status_code == 200
    matches = [item for item in list_response.json() if item["title"] == title]
    assert len(matches) == 1
    assert matches[0]["upvoteCount"] == 1


def test_tc068_repeated_upvote_calls_never_record_more_than_one_vote_per_user(
    client: TestClient,
) -> None:
    """AC-023/NFR-008: once a user has upvoted an idea, further vote calls by that
    same user -- including a burst of near-simultaneous repeats -- never push the
    idea's upvote count, or this user's vote, past one."""
    title = "Faster search"
    description = "Make search results load faster"

    _, token = _register_and_login(client, email="voter2@example.com")
    idea_id = _create_idea(client, token=token, title=title, description=description)

    first_vote_response = client.post(
        f"/ideas/{idea_id}/vote",
        headers={"Authorization": f"Bearer {token}"},
    )

    assert first_vote_response.status_code == 200, first_vote_response.text
    assert first_vote_response.json()["voteCount"] == 1

    repeat_responses = [
        client.post(
            f"/ideas/{idea_id}/vote",
            headers={"Authorization": f"Bearer {token}"},
        )
        for _ in range(3)
    ]

    for repeat_response in repeat_responses:
        assert repeat_response.status_code == 200, repeat_response.text
        assert repeat_response.json()["voteCount"] == 1

    list_response = client.get("/ideas")

    assert list_response.status_code == 200
    matches = [item for item in list_response.json() if item["title"] == title]
    assert len(matches) == 1
    assert matches[0]["upvoteCount"] == 1


def test_tc070_unauthenticated_vote_attempt_is_refused(client: TestClient) -> None:
    """AC-024: a visitor with no session token is refused when attempting to
    upvote an idea, and no vote is recorded."""
    title = "Faster search"
    description = "Make search results load faster"

    _, token = _register_and_login(client, email="owner3@example.com")
    idea_id = _create_idea(client, token=token, title=title, description=description)

    vote_response = client.post(f"/ideas/{idea_id}/vote")

    assert vote_response.status_code == 401

    list_response = client.get("/ideas")

    assert list_response.status_code == 200
    matches = [item for item in list_response.json() if item["title"] == title]
    assert len(matches) == 1
    assert matches[0]["upvoteCount"] == 0
