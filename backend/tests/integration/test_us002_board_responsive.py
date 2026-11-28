"""Integration tests for US-002: the board displays correctly on mobile and desktop.

The board itself is a frontend concern, but what makes it "readable and usable" on a
narrow viewport (AC-004) or able to "use the available width" on a desktop viewport
(AC-005) is that GET /ideas returns complete data for every idea -- title, description
and vote count -- with no extra round trip needed. These tests confirm the public
/ideas contract supplies that data, for a single idea and for a populated board alike.
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


def test_tc037_ideas_list_returns_full_data_needed_for_mobile_rendering(
    client: TestClient, db_session: Session
) -> None:
    _make_idea(
        db_session,
        title="Dark mode for the board",
        description="Add a dark theme option",
        upvote_count=42,
    )

    response = client.get("/ideas")

    assert response.status_code == 200
    body = response.json()
    assert len(body) == 1
    item = body[0]
    assert item["title"] == "Dark mode for the board"
    assert item["description"] == "Add a dark theme option"
    assert item["upvoteCount"] == 42


def test_tc040_ideas_list_returns_full_data_for_a_populated_desktop_layout(
    client: TestClient, db_session: Session
) -> None:
    seeded = [
        ("First idea", "Description of the first idea", 42),
        ("Second idea", "Description of the second idea", 30),
        ("Third idea", "Description of the third idea", 30),
        ("Fourth idea", "Description of the fourth idea", 10),
        ("Fifth idea", "Description of the fifth idea", 0),
    ]
    for title, description, upvote_count in seeded:
        _make_idea(db_session, title=title, description=description, upvote_count=upvote_count)

    response = client.get("/ideas")

    assert response.status_code == 200
    body = response.json()
    assert len(body) == 5

    seeded_by_title = {
        title: (description, upvote_count) for title, description, upvote_count in seeded
    }
    returned_titles = {item["title"] for item in body}
    assert returned_titles == set(seeded_by_title)

    for item in body:
        assert "title" in item
        assert "description" in item
        assert "upvoteCount" in item
        expected_description, expected_upvote_count = seeded_by_title[item["title"]]
        assert item["description"] == expected_description
        assert item["upvoteCount"] == expected_upvote_count
