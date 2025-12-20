"""add_parsed_ua_fields_to_click_events

Revision ID: a1b2c3d4e5f6
Revises: 9b8986e3995b
Create Date: 2025-01-20 12:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'a1b2c3d4e5f6'
down_revision: Union[str, None] = '9b8986e3995b'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Add parsed user agent fields to click_events table."""
    op.add_column('click_events', sa.Column('device_category', sa.String(length=20), nullable=True))
    op.add_column('click_events', sa.Column('browser_name', sa.String(length=50), nullable=True))
    op.add_column('click_events', sa.Column('browser_version', sa.String(length=20), nullable=True))
    op.add_column('click_events', sa.Column('os_name', sa.String(length=50), nullable=True))
    op.add_column('click_events', sa.Column('os_version', sa.String(length=20), nullable=True))
    op.add_column('click_events', sa.Column('engine', sa.String(length=20), nullable=True))


def downgrade() -> None:
    """Remove parsed user agent fields from click_events table."""
    op.drop_column('click_events', 'engine')
    op.drop_column('click_events', 'os_version')
    op.drop_column('click_events', 'os_name')
    op.drop_column('click_events', 'browser_version')
    op.drop_column('click_events', 'browser_name')
    op.drop_column('click_events', 'device_category')

