"""Initial migration — create all tables

Revision ID: 001_initial
Revises:
Create Date: 2025-01-01 00:00:00.000000
"""
from alembic import op
import sqlalchemy as sa

revision = "001_initial"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    # users
    op.create_table(
        "users",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("email", sa.String(255), unique=True, nullable=False),
        sa.Column("username", sa.String(100), unique=True, nullable=False),
        sa.Column("hashed_password", sa.String(255), nullable=False),
        sa.Column("full_name", sa.String(255)),
        sa.Column("avatar_url", sa.String(500)),
        sa.Column("bio", sa.Text()),
        sa.Column("role", sa.String(20), default="freelancer"),
        sa.Column("is_verified", sa.Boolean(), default=False),
        sa.Column("is_active", sa.Boolean(), default=True),
        sa.Column("trust_score", sa.Float(), default=50.0),
        sa.Column("trust_score_breakdown", sa.JSON(), default={}),
        sa.Column("skills", sa.JSON(), default=[]),
        sa.Column("hourly_rate", sa.Float()),
        sa.Column("location", sa.String(255)),
        sa.Column("phone", sa.String(50)),
        sa.Column("phone_verified", sa.Boolean(), default=False),
        sa.Column("identity_verified", sa.Boolean(), default=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), onupdate=sa.func.now()),
    )
    op.create_index("ix_users_email", "users", ["email"])
    op.create_index("ix_users_username", "users", ["username"])

    # projects
    op.create_table(
        "projects",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("title", sa.String(500), nullable=False),
        sa.Column("description", sa.Text()),
        sa.Column("client_id", sa.Integer(), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("freelancer_id", sa.Integer(), sa.ForeignKey("users.id")),
        sa.Column("status", sa.String(30), default="draft"),
        sa.Column("budget_min", sa.Float()),
        sa.Column("budget_max", sa.Float()),
        sa.Column("agreed_price", sa.Float()),
        sa.Column("skills_required", sa.JSON(), default=[]),
        sa.Column("ai_blueprint", sa.JSON(), default={}),
        sa.Column("deadline", sa.DateTime(timezone=True)),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), onupdate=sa.func.now()),
    )

    # milestones
    op.create_table(
        "milestones",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("project_id", sa.Integer(), sa.ForeignKey("projects.id"), nullable=False),
        sa.Column("title", sa.String(500), nullable=False),
        sa.Column("description", sa.Text()),
        sa.Column("amount", sa.Float(), nullable=False),
        sa.Column("status", sa.String(30), default="pending"),
        sa.Column("due_date", sa.DateTime(timezone=True)),
        sa.Column("completed_at", sa.DateTime(timezone=True)),
        sa.Column("stripe_payment_intent_id", sa.String(255)),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )

    # messages
    op.create_table(
        "messages",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("project_id", sa.Integer(), sa.ForeignKey("projects.id"), nullable=False),
        sa.Column("sender_id", sa.Integer(), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("content", sa.Text(), nullable=False),
        sa.Column("message_type", sa.String(50), default="text"),
        sa.Column("file_url", sa.String(500)),
        sa.Column("is_read", sa.Boolean(), default=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )

    # escrows
    op.create_table(
        "escrows",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("project_id", sa.Integer(), sa.ForeignKey("projects.id"), unique=True, nullable=False),
        sa.Column("total_amount", sa.Float(), nullable=False),
        sa.Column("funded_amount", sa.Float(), default=0.0),
        sa.Column("released_amount", sa.Float(), default=0.0),
        sa.Column("stripe_account_id", sa.String(255)),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )

    # wallets
    op.create_table(
        "wallets",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("user_id", sa.Integer(), sa.ForeignKey("users.id"), unique=True, nullable=False),
        sa.Column("balance", sa.Float(), default=0.0),
        sa.Column("pending_balance", sa.Float(), default=0.0),
        sa.Column("total_earned", sa.Float(), default=0.0),
        sa.Column("total_spent", sa.Float(), default=0.0),
        sa.Column("stripe_account_id", sa.String(255)),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), onupdate=sa.func.now()),
    )

    # transactions
    op.create_table(
        "transactions",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("wallet_id", sa.Integer(), sa.ForeignKey("wallets.id"), nullable=False),
        sa.Column("amount", sa.Float(), nullable=False),
        sa.Column("transaction_type", sa.String(50)),
        sa.Column("description", sa.String(500)),
        sa.Column("stripe_payment_intent_id", sa.String(255)),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )

    # skill_test_results
    op.create_table(
        "skill_test_results",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("user_id", sa.Integer(), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("skill_name", sa.String(255), nullable=False),
        sa.Column("score", sa.Integer()),
        sa.Column("max_score", sa.Integer()),
        sa.Column("percentage", sa.Float()),
        sa.Column("passed", sa.Boolean()),
        sa.Column("answers", sa.JSON()),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )


def downgrade() -> None:
    op.drop_table("skill_test_results")
    op.drop_table("transactions")
    op.drop_table("wallets")
    op.drop_table("escrows")
    op.drop_table("messages")
    op.drop_table("milestones")
    op.drop_table("projects")
    op.drop_index("ix_users_username", "users")
    op.drop_index("ix_users_email", "users")
    op.drop_table("users")
