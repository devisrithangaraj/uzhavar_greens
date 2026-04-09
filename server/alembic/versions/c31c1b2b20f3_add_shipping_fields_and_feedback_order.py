"""add shipping fields and feedback order link

Revision ID: c31c1b2b20f3
Revises: b7f2a0195d1c
Create Date: 2026-04-06 14:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "c31c1b2b20f3"
down_revision: Union[str, Sequence[str], None] = "b7f2a0195d1c"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("orders", sa.Column("shipping_phone", sa.String(), nullable=True))
    op.add_column("orders", sa.Column("shipping_address", sa.String(), nullable=True))
    op.execute("UPDATE orders SET shipping_phone = '' WHERE shipping_phone IS NULL")
    op.execute("UPDATE orders SET shipping_address = '' WHERE shipping_address IS NULL")
    op.alter_column("orders", "shipping_phone", nullable=False)
    op.alter_column("orders", "shipping_address", nullable=False)

    op.add_column("feedbacks", sa.Column("order_id", sa.Integer(), nullable=True))
    op.create_unique_constraint("uq_feedbacks_order_id", "feedbacks", ["order_id"])
    op.create_foreign_key("fk_feedbacks_order_id_orders", "feedbacks", "orders", ["order_id"], ["id"])


def downgrade() -> None:
    op.drop_constraint("fk_feedbacks_order_id_orders", "feedbacks", type_="foreignkey")
    op.drop_constraint("uq_feedbacks_order_id", "feedbacks", type_="unique")
    op.drop_column("feedbacks", "order_id")

    op.drop_column("orders", "shipping_address")
    op.drop_column("orders", "shipping_phone")

