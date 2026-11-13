
"""add patient profile image and photo consent

Revision ID: 2730677d1bba
Revises: eb0aa7ec71a8
Create Date: 2026-11-04 22:51:03.964612
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '2730677d1bba'
down_revision: Union[str, Sequence[str], None] = 'eb0aa7ec71a8'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""

    op.add_column(
        'patients',
        sa.Column(
            'profile_image',
            sa.String(length=500),
            nullable=True
        )
    )

    op.add_column(
        'patients',
        sa.Column(
            'photo_consent',
            sa.Boolean(),
            nullable=False,
            server_default=sa.false()
        )
    )


def downgrade() -> None:
    """Downgrade schema."""

    op.drop_column('patients', 'photo_consent')
    op.drop_column('patients', 'profile_image')
