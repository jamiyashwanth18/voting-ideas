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
