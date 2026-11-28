"""Unit tests for the logic behind POST /ideas/{id}/vote: upvoting an idea (US-009)."""

import secrets
from uuid import uuid4

import pytest
from fastapi import HTTPException
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.auth import USER_ROLE, ensure_user, find_user
from app.errors import IDEA_NOT_FOUND, SESSION_EXPIRED
from app.models import Idea, Vote
from app.routers.ideas import create_idea, vote_idea
from app.schemas import IdeaCreate


def _make_user(db_session: Session, *, n: int = 0):
    email = f"voter-{n}-{uuid4().hex[:12]}@example.com"
    ensure_user(db_session, email=email, password=secrets.token_urlsafe(), role=USER_ROLE)
    return find_user(db_session, email)


def _make_idea(db_session: Session, author) -> Idea:
    created = create_idea(
        IdeaCreate(title="Dark mode", description="Add a dark theme to the board"),
        author,
        db_session,
    )
    return db_session.get(Idea, created.id)


def test_ac022_the_first_upvote_increases_the_count_by_one(db_session: Session) -> None:
    author = _make_user(db_session, n=1)
    idea = _make_idea(db_session, author)
    voter = _make_user(db_session, n=2)

    result = vote_idea(idea.id, voter, db_session)

    assert result.vote_count == 1
    assert result.voted is True


def test_ac022_the_users_vote_is_recorded_in_the_votes_table(db_session: Session) -> None:
    author = _make_user(db_session, n=3)
    idea = _make_idea(db_session, author)
    voter = _make_user(db_session, n=4)

    vote_idea(idea.id, voter, db_session)

    rows = db_session.query(Vote).filter(Vote.idea_id == idea.id, Vote.user_id == voter.id).all()
    assert len(rows) == 1


def test_ac022_an_id_matching_no_idea_is_refused_as_not_found(db_session: Session) -> None:
    voter = _make_user(db_session, n=5)

    with pytest.raises(HTTPException) as excinfo:
        vote_idea(str(uuid4()), voter, db_session)

    assert excinfo.value.status_code == IDEA_NOT_FOUND.status
    assert excinfo.value.detail == IDEA_NOT_FOUND.message


def test_ac023_a_second_upvote_from_the_same_user_records_nothing_more(
    db_session: Session,
) -> None:
    author = _make_user(db_session, n=6)
    idea = _make_idea(db_session, author)
    voter = _make_user(db_session, n=7)

    vote_idea(idea.id, voter, db_session)
    result = vote_idea(idea.id, voter, db_session)

    assert result.vote_count == 1
    assert result.voted is True
    rows = db_session.query(Vote).filter(Vote.idea_id == idea.id, Vote.user_id == voter.id).all()
    assert len(rows) == 1


def test_ac023_the_count_does_not_increase_beyond_one_for_that_user(db_session: Session) -> None:
    author = _make_user(db_session, n=8)
    idea = _make_idea(db_session, author)
    voter = _make_user(db_session, n=9)
    other_voter = _make_user(db_session, n=10)

    vote_idea(idea.id, voter, db_session)
    vote_idea(idea.id, voter, db_session)
    vote_idea(idea.id, voter, db_session)
    result = vote_idea(idea.id, other_voter, db_session)

    # The repeated attempts from `voter` never pushed the count past the single vote
    # they are entitled to; only `other_voter`'s distinct vote adds a second.
    assert result.vote_count == 2


def test_nfr008_a_vote_already_recorded_by_a_concurrent_request_is_not_duplicated(
    db_session: Session,
) -> None:
    """Simulates the race NFR-008 guards against: another of this user's requests has
    already inserted the row by the time this one tries to, which is exactly what two
    simultaneous clicks racing each other looks like from inside a single handler. The
    table's unique constraint, not a check this handler makes first, is what turns the
    second attempt into a no-op.
    """
    author = _make_user(db_session, n=11)
    idea = _make_idea(db_session, author)
    voter = _make_user(db_session, n=12)
    db_session.add(Vote(id=str(uuid4()), idea_id=idea.id, user_id=voter.id))
    db_session.commit()

    result = vote_idea(idea.id, voter, db_session)

    assert result.vote_count == 1
    assert result.voted is True
    rows = db_session.query(Vote).filter(Vote.idea_id == idea.id, Vote.user_id == voter.id).all()
    assert len(rows) == 1
    # The session survived the constraint violation and can still be used normally
    # afterwards (e.g. by the count re-read vote_idea itself does).
    assert db_session.get(Idea, idea.id) is not None


def test_ac024_an_unauthenticated_caller_is_refused_and_casts_no_vote(
    client: TestClient, db_session: Session
) -> None:
    author = _make_user(db_session, n=13)
    idea = _make_idea(db_session, author)

    response = client.post(f"/ideas/{idea.id}/vote")

    assert response.status_code == SESSION_EXPIRED.status
    assert response.json()["detail"] == SESSION_EXPIRED.message
    assert db_session.query(Vote).filter(Vote.idea_id == idea.id).count() == 0
