"""add checkout ref and pincode

Revision ID: e5f0ea8f11b2
Revises: c31c1b2b20f3
Create Date: 2026-04-06 16:10:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "e5f0ea8f11b2"
down_revision: Union[str, Sequence[str], None] = "c31c1b2b20f3"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("orders", sa.Column("checkout_ref", sa.String(), nullable=True))
    op.add_column("orders", sa.Column("shipping_pincode", sa.String(), nullable=True))

    op.execute("UPDATE orders SET checkout_ref = CONCAT('LEGACY-', id) WHERE checkout_ref IS NULL")
    op.execute("UPDATE orders SET shipping_pincode = '' WHERE shipping_pincode IS NULL")

    op.alter_column("orders", "checkout_ref", nullable=False)
    op.alter_column("orders", "shipping_pincode", nullable=False)
    op.create_index(op.f("ix_orders_checkout_ref"), "orders", ["checkout_ref"], unique=False)


def downgrade() -> None:
    op.drop_index(op.f("ix_orders_checkout_ref"), table_name="orders")
    op.drop_column("orders", "shipping_pincode")
    op.drop_column("orders", "checkout_ref")

