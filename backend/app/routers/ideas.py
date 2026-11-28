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

from fastapi import APIRouter, Depends
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.auth import current_user
from app.database import get_db
from app.errors import SESSION_EXPIRED
from app.models import Idea, User, Vote
from app.schemas import IdeaCreate, IdeaRead

router = APIRouter(tags=["Ideas"])


@router.get("/ideas")
def list_ideas(session: Annotated[Session, Depends(get_db)]) -> list[IdeaRead]:
    # The number of upvotes is counted from `votes` itself, not read back from the
    # `upvote_count` column on `ideas`: a vote is the source of truth, so the count is
    # always right however the vote came to exist, never a cache that a missed update
    # could leave stale.
    vote_count = func.count(Vote.id).label("vote_count")
    rows = session.execute(
        select(Idea, vote_count)
        .outerjoin(Vote, Vote.idea_id == Idea.id)
        .group_by(Idea.id)
        # Highest upvote count first (AC-001); ties break on posting order, then id,
        # so the order is the same on every reload (AC-002, NFR-010).
        .order_by(vote_count.desc(), Idea.created_at.asc(), Idea.id.asc())
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
