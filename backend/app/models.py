"""SQLAlchemy models: one class per entity in the approved data model."""

from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, String, UniqueConstraint, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, nullable=False)
    email: Mapped[str] = mapped_column(String(255), nullable=False)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    role: Mapped[str] = mapped_column(String(50), nullable=False)


class UserSession(Base):
    """One login that is still, or was, active (US-004): the table behind `sessions`.

    The bearer token itself is never stored, only a one-way digest of it (app/auth.py),
    so a copy of this table leaked on its own cannot be replayed as a session. A session
    past its `expires_at` is treated as gone (AC-012, NFR-002): every verified request
    pushes `expires_at` forward again, so only inactivity -- never mere age -- ends one.
    """

    __tablename__ = "sessions"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, nullable=False)
    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id"), nullable=False)
    token_hash: Mapped[str] = mapped_column(String(64), nullable=False, unique=True)
    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )


class Idea(Base):
    """One idea on the public board (US-001)."""

    __tablename__ = "ideas"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, nullable=False)
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    description: Mapped[str] = mapped_column(String(2000), nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )

    votes: Mapped[list["Vote"]] = relationship(back_populates="idea")


class Vote(Base):
    """One upvote cast by one user on one idea: at most one per user per idea."""

    __tablename__ = "votes"
    __table_args__ = (UniqueConstraint("idea_id", "user_id", name="uq_votes_idea_user"),)

    id: Mapped[str] = mapped_column(String(36), primary_key=True, nullable=False)
    idea_id: Mapped[str] = mapped_column(String(36), ForeignKey("ideas.id"), nullable=False)
    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id"), nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )

    idea: Mapped["Idea"] = relationship(back_populates="votes")
