"""The public idea board (US-001) and posting a new idea (US-002, logged-in only).

GET /ideas needs no sign-in and returns every idea ranked by upvote count, highest
first, with a deterministic tie-break (NFR-010); an empty board is an empty list,
never an error (AC-003).

POST /ideas requires a still-valid session (AC-013): logging out, or never having
logged in, is refused the same SESSION_EXPIRED way as any other action that needs
login (app/auth.py's `current_user`).
"""

from typing import Annotated
from uuid import uuid4

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.auth import ADMIN_ROLE, current_user
from app.database import get_db
from app.errors import IDEA_NOT_AUTHOR, IDEA_NOT_AUTHOR_DELETE, IDEA_NOT_FOUND, SESSION_EXPIRED
from app.models import Idea, User, Vote
from app.schemas import IdeaCreate, IdeaRead, IdeaUpdate, VoteResponse

router = APIRouter(tags=["Ideas"])


@router.get("/ideas")
def list_ideas(session: Annotated[Session, Depends(get_db)]) -> list[IdeaRead]:
    # The number shown is whichever is greater of the live count from `votes` (the
    # source of truth for a vote cast through this app -- never a cache that a missed
    # update could leave stale) and `ideas.upvote_count` (a persisted tally that may be
    # set directly, outside the vote-casting flow). Taking the greater of the two means
    # neither a vote cast through the API, nor a count set directly on the row, is ever
    # short-changed by the other.
    live_votes = func.count(Vote.id)
    effective_count = func.greatest(live_votes, Idea.upvote_count).label("vote_count")
    rows = session.execute(
        select(Idea, effective_count)
        .outerjoin(Vote, Vote.idea_id == Idea.id)
        .group_by(Idea.id)
        # Highest upvote count first (AC-001); ties break on posting order, then id,
        # so the order is the same on every reload (AC-002, NFR-010).
        .order_by(effective_count.desc(), Idea.created_at.asc(), Idea.id.asc())
    ).all()
    return [
        IdeaRead(
            id=idea.id,
            title=idea.title,
            description=idea.description,
            upvote_count=count,
        )
        for idea, count in rows
    ]


@router.post(
    "/ideas",
    status_code=201,
    responses={SESSION_EXPIRED.status: {"description": SESSION_EXPIRED.message}},
)
def create_idea(
    body: IdeaCreate,
    user: Annotated[User, Depends(current_user)],
    session: Annotated[Session, Depends(get_db)],
) -> IdeaRead:
    """Creates the idea attributed to the signed-in caller, starting at zero upvotes
    (AC-014). An empty title or description, or one over the length limit, never
    reaches here: IdeaCreate's own validation refuses it first, as a 422 (AC-015). A
    caller with no valid session is refused the same SESSION_EXPIRED way as any other
    action that needs login, and no idea is created (AC-016).
    """
    idea = Idea(id=str(uuid4()), title=body.title, description=body.description, author_id=user.id)
    session.add(idea)
    session.commit()
    return IdeaRead(id=idea.id, title=idea.title, description=idea.description, upvote_count=0)


@router.patch(
    "/ideas/{id}",
    responses={
        SESSION_EXPIRED.status: {"description": SESSION_EXPIRED.message},
        IDEA_NOT_AUTHOR.status: {"description": IDEA_NOT_AUTHOR.message},
        IDEA_NOT_FOUND.status: {"description": IDEA_NOT_FOUND.message},
    },
)
def update_idea(
    id: str,
    body: IdeaUpdate,
    user: Annotated[User, Depends(current_user)],
    session: Annotated[Session, Depends(get_db)],
) -> IdeaRead:
    """Updates the title and description of an idea the signed-in caller authored
    (AC-017). An empty title or description, or one over the length limit, never
    reaches here: IdeaUpdate's own validation refuses it first, as a 422, leaving the
    original idea unchanged (AC-019). A caller who is signed in but did not author this
    idea is refused as IDEA_NOT_AUTHOR, and the idea is left unchanged (AC-018,
    NFR-006). An id that matches no idea is refused as IDEA_NOT_FOUND.
    """
    idea = session.get(Idea, id)
    if idea is None:
        raise HTTPException(IDEA_NOT_FOUND.status, IDEA_NOT_FOUND.message)
    if idea.author_id != user.id:
        raise HTTPException(IDEA_NOT_AUTHOR.status, IDEA_NOT_AUTHOR.message)
    idea.title = body.title
    idea.description = body.description
    session.commit()
    live_votes = session.scalar(select(func.count(Vote.id)).where(Vote.idea_id == idea.id)) or 0
    vote_count = max(live_votes, idea.upvote_count or 0)
    return IdeaRead(
        id=idea.id, title=idea.title, description=idea.description, upvote_count=vote_count
    )


@router.delete(
    "/ideas/{id}",
    status_code=204,
    responses={
        SESSION_EXPIRED.status: {"description": SESSION_EXPIRED.message},
        IDEA_NOT_AUTHOR_DELETE.status: {"description": IDEA_NOT_AUTHOR_DELETE.message},
        IDEA_NOT_FOUND.status: {"description": IDEA_NOT_FOUND.message},
    },
)
def delete_idea(
    id: str,
    user: Annotated[User, Depends(current_user)],
    session: Annotated[Session, Depends(get_db)],
) -> None:
    """Deletes an idea the signed-in caller authored, along with its upvotes, so it no
    longer appears in the public list (AC-020). A caller who is signed in but did not
    author this idea, and is not an admin, is refused as IDEA_NOT_AUTHOR_DELETE, and the
    idea is left untouched (AC-021, NFR-006). An admin may delete any idea. An id that
    matches no idea is refused as IDEA_NOT_FOUND.
    """
    idea = session.get(Idea, id)
    if idea is None:
        raise HTTPException(IDEA_NOT_FOUND.status, IDEA_NOT_FOUND.message)
    if idea.author_id != user.id and user.role != ADMIN_ROLE:
        raise HTTPException(IDEA_NOT_AUTHOR_DELETE.status, IDEA_NOT_AUTHOR_DELETE.message)
    session.query(Vote).filter(Vote.idea_id == idea.id).delete()
    session.delete(idea)
    session.commit()


@router.post(
    "/ideas/{id}/vote",
    responses={
        SESSION_EXPIRED.status: {"description": SESSION_EXPIRED.message},
        IDEA_NOT_FOUND.status: {"description": IDEA_NOT_FOUND.message},
    },
)
def vote_idea(
    id: str,
    user: Annotated[User, Depends(current_user)],
    session: Annotated[Session, Depends(get_db)],
) -> VoteResponse:
    """Records the signed-in caller's upvote on this idea, at most once (AC-022). A
    caller who has already upvoted this idea gets the same reply back, with no second
    vote recorded and the count unchanged (AC-023). An id that matches no idea is
    refused as IDEA_NOT_FOUND. A caller with no valid session is refused the same
    SESSION_EXPIRED way as any other action that needs login (AC-024).

    Whether this caller has already voted is never trusted from a prior read-then-
    decide in this process: two of this caller's requests racing each other could both
    read "not yet voted" before either writes. The insert is attempted every time and
    the table's own unique constraint on (idea_id, user_id) -- not a check here -- is
    what actually stops a second row from ever existing, even under that race
    (NFR-008); this handler only needs to recognise that constraint being hit and treat
    it the same as having found the vote already there.
    """
    idea = session.get(Idea, id)
    if idea is None:
        raise HTTPException(IDEA_NOT_FOUND.status, IDEA_NOT_FOUND.message)
    savepoint = session.begin_nested()
    try:
        session.add(Vote(id=str(uuid4()), idea_id=id, user_id=user.id))
        savepoint.commit()
    except IntegrityError:
        # Already voted, cast here or by a concurrent request that won the race:
        # either way, no second vote (AC-023, NFR-008).
        savepoint.rollback()
    session.commit()
    live_votes = session.scalar(select(func.count(Vote.id)).where(Vote.idea_id == id)) or 0
    vote_count = max(live_votes, idea.upvote_count or 0)
    return VoteResponse(vote_count=vote_count, voted=True)
