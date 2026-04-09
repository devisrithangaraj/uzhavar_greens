"""add order status and feedback

Revision ID: b7f2a0195d1c
Revises: 2c4f83f49a00
Create Date: 2026-04-06 12:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "b7f2a0195d1c"
down_revision: Union[str, Sequence[str], None] = "2c4f83f49a00"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("orders", sa.Column("status", sa.String(), nullable=False, server_default="New"))
    op.alter_column("orders", "status", server_default=None)

    op.create_table(
        "feedbacks",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("message", sa.String(), nullable=False),
        sa.Column("rating", sa.Integer(), nullable=False),
        sa.Column("featured", sa.Boolean(), nullable=False, server_default=sa.false()),
        sa.Column("created_at", sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_feedbacks_id"), "feedbacks", ["id"], unique=False)


def downgrade() -> None:
    op.drop_index(op.f("ix_feedbacks_id"), table_name="feedbacks")
    op.drop_table("feedbacks")
    op.drop_column("orders", "status")

