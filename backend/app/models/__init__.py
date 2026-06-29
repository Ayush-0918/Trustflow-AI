from sqlalchemy import (
    Column, Integer, String, Float, Boolean, DateTime, Text,
    ForeignKey, Enum, JSON
)
from sqlalchemy.orm import relationship, DeclarativeBase
from sqlalchemy.sql import func
import enum


class Base(DeclarativeBase):
    pass


class UserRole(str, enum.Enum):
    CLIENT = "client"
    FREELANCER = "freelancer"
    BOTH = "both"


class ProjectStatus(str, enum.Enum):
    DRAFT = "draft"
    OPEN = "open"
    IN_PROGRESS = "in_progress"
    REVIEW = "review"
    COMPLETED = "completed"
    DISPUTED = "disputed"
    CANCELLED = "cancelled"


class MilestoneStatus(str, enum.Enum):
    PENDING = "pending"
    FUNDED = "funded"
    SUBMITTED = "submitted"
    APPROVED = "approved"
    RELEASED = "released"
    DISPUTED = "disputed"


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    username = Column(String(100), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255))
    avatar_url = Column(String(500))
    bio = Column(Text)
    role = Column(Enum(UserRole), default=UserRole.FREELANCER)
    is_verified = Column(Boolean, default=False)
    is_active = Column(Boolean, default=True)
    trust_score = Column(Float, default=50.0)
    trust_score_breakdown = Column(JSON, default=dict)
    skills = Column(JSON, default=list)
    hourly_rate = Column(Float, nullable=True)
    location = Column(String(255))
    phone = Column(String(50))
    phone_verified = Column(Boolean, default=False)
    identity_verified = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    client_projects = relationship("Project", foreign_keys="Project.client_id", back_populates="client")
    freelancer_projects = relationship("Project", foreign_keys="Project.freelancer_id", back_populates="freelancer")
    sent_messages = relationship("Message", back_populates="sender")
    wallet = relationship("Wallet", back_populates="user", uselist=False)
    skill_results = relationship("SkillTestResult", back_populates="user")


class Project(Base):
    __tablename__ = "projects"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(500), nullable=False)
    description = Column(Text)
    client_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    freelancer_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    status = Column(Enum(ProjectStatus), default=ProjectStatus.DRAFT)
    budget_min = Column(Float)
    budget_max = Column(Float)
    agreed_price = Column(Float)
    skills_required = Column(JSON, default=list)
    ai_blueprint = Column(JSON, default=dict)
    deadline = Column(DateTime(timezone=True))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    client = relationship("User", foreign_keys=[client_id], back_populates="client_projects")
    freelancer = relationship("User", foreign_keys=[freelancer_id], back_populates="freelancer_projects")
    milestones = relationship("Milestone", back_populates="project", cascade="all, delete-orphan")
    messages = relationship("Message", back_populates="project", cascade="all, delete-orphan")
    escrow = relationship("Escrow", back_populates="project", uselist=False)


class Milestone(Base):
    __tablename__ = "milestones"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    title = Column(String(500), nullable=False)
    description = Column(Text)
    amount = Column(Float, nullable=False)
    status = Column(Enum(MilestoneStatus), default=MilestoneStatus.PENDING)
    due_date = Column(DateTime(timezone=True))
    completed_at = Column(DateTime(timezone=True))
    stripe_payment_intent_id = Column(String(255))
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    project = relationship("Project", back_populates="milestones")


class Message(Base):
    __tablename__ = "messages"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    sender_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    content = Column(Text, nullable=False)
    message_type = Column(String(50), default="text")  # text, file, system
    file_url = Column(String(500))
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    project = relationship("Project", back_populates="messages")
    sender = relationship("User", back_populates="sent_messages")


class Escrow(Base):
    __tablename__ = "escrows"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"), unique=True, nullable=False)
    total_amount = Column(Float, nullable=False)
    funded_amount = Column(Float, default=0.0)
    released_amount = Column(Float, default=0.0)
    stripe_account_id = Column(String(255))
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    project = relationship("Project", back_populates="escrow")


class Wallet(Base):
    __tablename__ = "wallets"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    balance = Column(Float, default=0.0)
    pending_balance = Column(Float, default=0.0)
    total_earned = Column(Float, default=0.0)
    total_spent = Column(Float, default=0.0)
    stripe_account_id = Column(String(255))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    user = relationship("User", back_populates="wallet")
    transactions = relationship("Transaction", back_populates="wallet")


class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, index=True)
    wallet_id = Column(Integer, ForeignKey("wallets.id"), nullable=False)
    amount = Column(Float, nullable=False)
    transaction_type = Column(String(50))  # deposit, withdrawal, escrow_hold, escrow_release
    description = Column(String(500))
    stripe_payment_intent_id = Column(String(255))
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    wallet = relationship("Wallet", back_populates="transactions")


class SkillTestResult(Base):
    __tablename__ = "skill_test_results"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    skill_name = Column(String(255), nullable=False)
    score = Column(Integer)
    max_score = Column(Integer)
    percentage = Column(Float)
    passed = Column(Boolean)
    answers = Column(JSON)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="skill_results")
