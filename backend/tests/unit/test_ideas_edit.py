"""Unit tests for the logic behind PATCH /ideas/{id}: editing an idea (US-007)."""

import secrets
from uuid import uuid4

import pytest
from fastapi import HTTPException
from pydantic import ValidationError
from sqlalchemy.orm import Session

from app.auth import USER_ROLE, ensure_user, find_user
from app.errors import IDEA_NOT_AUTHOR, IDEA_NOT_FOUND
from app.models import Idea
from app.routers.ideas import create_idea, update_idea
from app.schemas import IdeaCreate, IdeaUpdate


def _make_user(db_session: Session):
    email = f"idea-editor-{uuid4().hex[:12]}@example.com"
    ensure_user(db_session, email=email, password=secrets.token_urlsafe(), role=USER_ROLE)
    return find_user(db_session, email)


def _make_idea(db_session: Session, author):
    return create_idea(
        IdeaCreate(title="Original title", description="Original description"),
        author,
        db_session,
    )


def test_ac017_the_author_edits_title_and_description_and_the_board_shows_the_new_text(
    db_session: Session,
) -> None:
    author = _make_user(db_session)
    created = _make_idea(db_session, author)

    result = update_idea(
        created.id,
        IdeaUpdate(title="Dark mode, revised", description="A refined dark theme"),
        author,
        db_session,
    )

    assert result.title == "Dark mode, revised"
    assert result.description == "A refined dark theme"
    stored = db_session.get(Idea, created.id)
    assert stored.title == "Dark mode, revised"
    assert stored.description == "A refined dark theme"


def test_ac018_a_non_author_is_refused_and_the_idea_is_unchanged(db_session: Session) -> None:
    author = _make_user(db_session)
    other = _make_user(db_session)
    created = _make_idea(db_session, author)

    with pytest.raises(HTTPException) as excinfo:
        update_idea(
            created.id,
            IdeaUpdate(title="Hijacked title", description="Hijacked description"),
            other,
            db_session,
        )

    assert excinfo.value.status_code == IDEA_NOT_AUTHOR.status
    assert excinfo.value.detail == IDEA_NOT_AUTHOR.message
    stored = db_session.get(Idea, created.id)
    assert stored.title == "Original title"
    assert stored.description == "Original description"


def test_ac018_an_id_matching_no_idea_is_refused_as_not_found(db_session: Session) -> None:
    author = _make_user(db_session)

    with pytest.raises(HTTPException) as excinfo:
        update_idea(
            str(uuid4()),
            IdeaUpdate(title="Does not matter", description="Does not matter either"),
            author,
            db_session,
        )

    assert excinfo.value.status_code == IDEA_NOT_FOUND.status
    assert excinfo.value.detail == IDEA_NOT_FOUND.message


def test_ac019_rejects_an_empty_title(db_session: Session) -> None:
    with pytest.raises(ValidationError):
        IdeaUpdate(title="", description="A description that is not empty")


def test_ac019_rejects_an_empty_description(db_session: Session) -> None:
    with pytest.raises(ValidationError):
        IdeaUpdate(title="A fine title", description="")


def test_ac019_rejects_a_title_over_the_length_limit(db_session: Session) -> None:
    with pytest.raises(ValidationError):
        IdeaUpdate(title="x" * 201, description="A description that is not empty")


def test_ac019_rejects_a_description_over_the_length_limit(db_session: Session) -> None:
    with pytest.raises(ValidationError):
        IdeaUpdate(title="A fine title", description="x" * 2001)


def test_ac019_no_change_is_made_when_validation_fails(db_session: Session) -> None:
    author = _make_user(db_session)
    created = _make_idea(db_session, author)

    with pytest.raises(ValidationError):
        IdeaUpdate(title="", description="")

    stored = db_session.get(Idea, created.id)
    assert stored.title == "Original title"
    assert stored.description == "Original description"
