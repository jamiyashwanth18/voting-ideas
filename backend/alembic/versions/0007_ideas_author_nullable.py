"""Make ideas.author_id nullable: a row seeded directly has no known author.

POST /ideas (US-006, AC-014) always sets it to the signed-in caller, but a row
inserted outside that endpoint -- a test fixture, a data import -- names no one;
such an idea belongs to no one, so `update_idea`/`delete_idea` (app/routers/ideas.py)
refuse every caller as non-author for it, exactly as they would for any other idea
this caller did not post.

Revision ID: 0007
Revises: 0006
"""

import sqlalchemy as sa
from alembic import op

revision: str = "0007"
down_revision: str | None = "0006"
branch_labels: str | None = None
depends_on: str | None = None


def upgrade() -> None:
    op.alter_column("ideas", "author_id", existing_type=sa.String(36), nullable=True)


def downgrade() -> None:
    op.alter_column("ideas", "author_id", existing_type=sa.String(36), nullable=False)
