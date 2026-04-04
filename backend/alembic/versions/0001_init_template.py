from alembic import op
import sqlalchemy as sa

revision = "0001_init_template"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "example_items",
        sa.Column("id", sa.String(length=64), primary_key=True),
        sa.Column("label", sa.String(length=255), nullable=False),
    )


def downgrade() -> None:
    op.drop_table("example_items")
