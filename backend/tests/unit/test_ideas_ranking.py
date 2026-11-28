"""Unit tests for the ranking logic behind GET /ideas (US-001.1)."""

from datetime import UTC, datetime, timedelta
from uuid import uuid4

from sqlalchemy.orm import Session

from app.auth import USER_ROLE, ensure_user, find_user
from app.models import Idea, Vote
from app.routers.ideas import list_ideas


def _make_voter(session: Session, *, n: int) -> str:
    email = f"voter-{n}-{uuid4().hex[:8]}@example.com"
    ensure_user(session, email=email, password="irrelevant-pw", role=USER_ROLE)
    return find_user(session, email).id


def _make_idea(session: Session, *, title: str, description: str, created_at: datetime) -> Idea:
    # author_id is NOT NULL (US-006, AC-014): every idea here is attributed to a fresh
    # user made just to own it, since this file is testing ranking, not authorship.
    author_id = _make_voter(session, n=hash((title, description)) % 1_000_000)
    idea = Idea(
        id=str(uuid4()),
        title=title,
        description=description,
        created_at=created_at,
        author_id=author_id,
    )
    session.add(idea)
    session.flush()
    return idea


def _vote(session: Session, *, idea_id: str, user_id: str) -> None:
    session.add(Vote(id=str(uuid4()), idea_id=idea_id, user_id=user_id))
    session.flush()


def test_ac001_orders_ideas_by_upvote_count_desc_with_details(db_session: Session) -> None:
    base = datetime.now(UTC)
    popular = _make_idea(db_session, title="Popular", description="Most upvoted", created_at=base)
    middling = _make_idea(
        db_session,
        title="Middling",
        description="Some upvotes",
        created_at=base + timedelta(seconds=1),
    )
    unloved = _make_idea(
        db_session,
        title="Unloved",
        description="No upvotes",
        created_at=base + timedelta(seconds=2),
    )
    for n in range(3):
        _vote(db_session, idea_id=popular.id, user_id=_make_voter(db_session, n=n))
    _vote(db_session, idea_id=middling.id, user_id=_make_voter(db_session, n=100))

    result = list_ideas(db_session)

    assert [r.id for r in result] == [popular.id, middling.id, unloved.id]
    assert [r.upvote_count for r in result] == [3, 1, 0]
    first = result[0]
    assert first.title == "Popular"
    assert first.description == "Most upvoted"


def test_ac002_ties_break_by_posting_order_then_id(db_session: Session) -> None:
    base = datetime.now(UTC)
    earlier = _make_idea(db_session, title="Earlier", description="Posted first", created_at=base)
    later = _make_idea(
        db_session,
        title="Later",
        description="Posted second",
        created_at=base + timedelta(seconds=1),
    )
    # Same upvote count (zero) for both: the tie must break on created_at, not on insertion
    # order into the session, so run the query twice and expect the same order both times.
    first_call = [r.id for r in list_ideas(db_session)]
    second_call = [r.id for r in list_ideas(db_session)]

    assert first_call == [earlier.id, later.id]
    assert second_call == first_call


def test_ac002_same_timestamp_ties_break_deterministically_by_id(db_session: Session) -> None:
    same_instant = datetime.now(UTC)
    a = _make_idea(db_session, title="A", description="Same instant as B", created_at=same_instant)
    b = _make_idea(db_session, title="B", description="Same instant as A", created_at=same_instant)
    expected = sorted([a.id, b.id])

    result = [r.id for r in list_ideas(db_session)]

    assert result == expected
    # Deterministic across repeated reads, not just within one.
    assert [r.id for r in list_ideas(db_session)] == expected


def test_ac003_empty_board_returns_empty_list_without_error(db_session: Session) -> None:
    result = list_ideas(db_session)

    assert result == []
