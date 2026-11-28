"""Unit tests for the logic behind POST /ideas: creating a new idea (US-006)."""

import secrets
from uuid import uuid4

import pytest
from fastapi import HTTPException
from pydantic import ValidationError
from sqlalchemy.orm import Session

from app.auth import USER_ROLE, current_user, ensure_user, find_user
from app.errors import SESSION_EXPIRED
from app.models import Idea
from app.routers.ideas import create_idea, list_ideas
from app.schemas import IdeaCreate


def _email() -> str:
    return f"idea-author-{uuid4().hex[:12]}@example.com"


def _make_user(db_session: Session):
    email = _email()
    ensure_user(db_session, email=email, password=secrets.token_urlsafe(), role=USER_ROLE)
    return find_user(db_session, email)


def test_ac014_creates_the_idea_attributed_to_the_signed_in_caller(db_session: Session) -> None:
    user = _make_user(db_session)

    result = create_idea(
        IdeaCreate(title="Dark mode", description="Add a dark theme to the board"), user, db_session
    )

    assert result.title == "Dark mode"
    assert result.description == "Add a dark theme to the board"
    stored = db_session.get(Idea, result.id)
    assert stored is not None
    assert stored.author_id == user.id


def test_ac014_the_new_idea_starts_at_zero_upvotes(db_session: Session) -> None:
    user = _make_user(db_session)

    result = create_idea(
        IdeaCreate(title="Faster search", description="Speed up the search box"), user, db_session
    )

    assert result.upvote_count == 0


def test_ac014_the_new_idea_appears_in_the_public_idea_list(db_session: Session) -> None:
    user = _make_user(db_session)

    created = create_idea(
        IdeaCreate(title="Export to CSV", description="Export the board as CSV"), user, db_session
    )

    board = list_ideas(db_session)

    assert created.id in [idea.id for idea in board]


def test_ac015_rejects_an_empty_title(db_session: Session) -> None:
    with pytest.raises(ValidationError):
        IdeaCreate(title="", description="A description that is not empty")


def test_ac015_rejects_an_empty_description(db_session: Session) -> None:
    with pytest.raises(ValidationError):
        IdeaCreate(title="A fine title", description="")


def test_ac015_rejects_a_title_over_the_length_limit(db_session: Session) -> None:
    with pytest.raises(ValidationError):
        IdeaCreate(title="x" * 201, description="A description that is not empty")


def test_ac015_rejects_a_description_over_the_length_limit(db_session: Session) -> None:
    with pytest.raises(ValidationError):
        IdeaCreate(title="A fine title", description="x" * 2001)


def test_ac015_no_idea_is_created_when_validation_fails(db_session: Session) -> None:
    with pytest.raises(ValidationError):
        IdeaCreate(title="", description="")

    assert db_session.query(Idea).count() == 0


def test_ac016_a_missing_session_is_refused_and_creates_no_idea(
    client, db_session: Session
) -> None:
    before = db_session.query(Idea).count()

    response = client.post("/ideas", json={"title": "Night mode", "description": "A dark theme"})

    assert response.status_code == SESSION_EXPIRED.status
    assert response.json()["detail"] == SESSION_EXPIRED.message
    assert db_session.query(Idea).count() == before


def test_ac016_current_user_dependency_refuses_with_no_token(db_session: Session) -> None:
    with pytest.raises(HTTPException) as excinfo:
        current_user(None, db_session)

    assert excinfo.value.status_code == SESSION_EXPIRED.status
    assert excinfo.value.detail == SESSION_EXPIRED.message
