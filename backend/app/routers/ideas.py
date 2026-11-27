"""The public idea board (US-001).

GET /ideas needs no sign-in and returns every idea ranked by upvote count, highest
first, with a deterministic tie-break (NFR-010); an empty board is an empty list,
never an error (AC-003).
"""

from typing import Annotated

from fastapi import APIRouter, Depends
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Idea, Vote
from app.schemas import IdeaRead

router = APIRouter(tags=["Ideas"])


@router.get("/ideas")
def list_ideas(session: Annotated[Session, Depends(get_db)]) -> list[IdeaRead]:
    upvote_count = func.count(Vote.id).label("upvote_count")
    rows = session.execute(
        select(Idea.id, Idea.title, Idea.description, upvote_count)
        .outerjoin(Vote, Vote.idea_id == Idea.id)
        .group_by(Idea.id)
        # Highest upvote count first (AC-001); ties break on posting order, then id,
        # so the order is the same on every reload (AC-002, NFR-010).
        .order_by(upvote_count.desc(), Idea.created_at.asc(), Idea.id.asc())
    ).all()
    return [
        IdeaRead(
            id=row.id,
            title=row.title,
            description=row.description,
            upvote_count=row.upvote_count,
        )
        for row in rows
    ]
