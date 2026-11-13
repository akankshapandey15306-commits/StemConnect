"""link campaigns with patients

Revision ID: eb0aa7ec71a8
Revises: 4dbbe5993556
Create Date: 2026-11-01 12:18:26.357895

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import mysql

# revision identifiers, used by Alembic.
revision: str = 'eb0aa7ec71a8'
down_revision: Union[str, Sequence[str], None] = '4dbbe5993556'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None





def upgrade() -> None:
    """Upgrade schema."""

    op.add_column(
        "campaigns",
        sa.Column("patient_id", sa.Integer(), nullable=True)
    )

    op.add_column(
        "campaigns",
        sa.Column("patient_photo_url", sa.String(length=500), nullable=True)
    )

    op.create_index(
        op.f("ix_campaigns_patient_id"),
        "campaigns",
        ["patient_id"],
        unique=False
    )

    op.create_foreign_key(
        "fk_campaigns_patient_id_patients",
        "campaigns",
        "patients",
        ["patient_id"],
        ["id"]
    )


def downgrade() -> None:
    """Downgrade schema."""

    op.drop_constraint(
        "fk_campaigns_patient_id_patients",
        "campaigns",
        type_="foreignkey"
    )

    op.drop_index(
        op.f("ix_campaigns_patient_id"),
        table_name="campaigns"
    )

    op.drop_column("campaigns", "patient_photo_url")
    op.drop_column("campaigns", "patient_id")
