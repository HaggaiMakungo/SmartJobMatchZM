"""merge multiple heads

Revision ID: f2215fe7d2cc
Revises: 001_create_users, 001_initial_schema
Create Date: 2025-11-25 08:37:44.702167

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'f2215fe7d2cc'
down_revision = ('001_create_users', '001_initial_schema')
branch_labels = None
depends_on = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass
