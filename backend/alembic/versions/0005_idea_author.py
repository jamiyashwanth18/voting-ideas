"""Add ideas.author_id: an idea is attributed to the user who posted it (US-006, AC-014).

Revision ID: 0005
Revises: 0004
"""

import sqlalchemy as sa
from alembic import op

revision: str = "0005"
down_revision: str | None = "0004"
branch_labels: str | None = None
depends_on: str | None = None


def upgrade() -> None:
    op.add_column(
        "ideas",
        sa.Column("author_id", sa.String(36), sa.ForeignKey("users.id"), nullable=False),
    )


def downgrade() -> None:
    op.drop_column("ideas", "author_id")
