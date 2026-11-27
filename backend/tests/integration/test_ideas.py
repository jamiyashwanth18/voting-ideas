"""Integration tests for GET /ideas: ranked listing, tie-break stability, and the
empty board (US-001).

GET /ideas is public and read-only; this sprint ships no endpoint to create an idea
or cast an upvote, so each test seeds the rows it needs directly in the database,
through the fields the public contract (IdeaRead in the API spec) names, then
asserts only on the public API's response.
"""

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
