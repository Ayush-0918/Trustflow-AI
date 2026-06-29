from pydantic import BaseModel, EmailStr, field_validator
from typing import Optional, List, Any
from datetime import datetime
from enum import Enum


# --- Auth ---
class UserCreate(BaseModel):
    email: EmailStr
    username: str
    password: str
    full_name: Optional[str] = None
    role: str = "freelancer"

    @field_validator("password")
    @classmethod
    def password_strength(cls, v):
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters")
        return v


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: "UserOut"


class UserOut(BaseModel):
    id: int
    email: str
    username: str
    full_name: Optional[str]
    avatar_url: Optional[str]
    bio: Optional[str]
    role: str
    is_verified: bool
    trust_score: float
    skills: List[str]
    hourly_rate: Optional[float]
    location: Optional[str]
    identity_verified: bool
    created_at: datetime

    class Config:
        from_attributes = True


class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    bio: Optional[str] = None
    skills: Optional[List[str]] = None
    hourly_rate: Optional[float] = None
    location: Optional[str] = None
    avatar_url: Optional[str] = None


# --- Projects ---
class ProjectCreate(BaseModel):
    title: str
    description: Optional[str] = None
    budget_min: Optional[float] = None
    budget_max: Optional[float] = None
    skills_required: List[str] = []
    deadline: Optional[datetime] = None


class ProjectOut(BaseModel):
    id: int
    title: str
    description: Optional[str]
    client_id: int
    freelancer_id: Optional[int]
    status: str
    budget_min: Optional[float]
    budget_max: Optional[float]
    agreed_price: Optional[float]
    skills_required: List[str]
    ai_blueprint: Optional[dict]
    deadline: Optional[datetime]
    created_at: datetime
    client: Optional[UserOut]
    freelancer: Optional[UserOut]

    class Config:
        from_attributes = True


class ProjectUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None
    agreed_price: Optional[float] = None
    freelancer_id: Optional[int] = None


# --- Milestones ---
class MilestoneCreate(BaseModel):
    title: str
    description: Optional[str] = None
    amount: float
    due_date: Optional[datetime] = None


class MilestoneOut(BaseModel):
    id: int
    project_id: int
    title: str
    description: Optional[str]
    amount: float
    status: str
    due_date: Optional[datetime]
    completed_at: Optional[datetime]
    created_at: datetime

    class Config:
        from_attributes = True


# --- Messages ---
class MessageCreate(BaseModel):
    content: str
    message_type: str = "text"


class MessageOut(BaseModel):
    id: int
    project_id: int
    sender_id: int
    content: str
    message_type: str
    file_url: Optional[str]
    is_read: bool
    created_at: datetime
    sender: Optional[UserOut]

    class Config:
        from_attributes = True


# --- Wallet ---
class WalletOut(BaseModel):
    id: int
    user_id: int
    balance: float
    pending_balance: float
    total_earned: float
    total_spent: float

    class Config:
        from_attributes = True


class TransactionOut(BaseModel):
    id: int
    amount: float
    transaction_type: str
    description: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True


# --- Trust ---
class TrustScoreOut(BaseModel):
    user_id: int
    overall_score: float
    breakdown: dict
    recommendations: List[str]


# --- Skills ---
class SkillQuestion(BaseModel):
    id: str
    question: str
    options: List[str]
    time_limit: int = 60


class SkillTestSubmit(BaseModel):
    skill_name: str
    answers: dict


class SkillTestResultOut(BaseModel):
    id: int
    skill_name: str
    score: int
    max_score: int
    percentage: float
    passed: bool
    created_at: datetime

    class Config:
        from_attributes = True


# --- AI Planner ---
class AIPlannerRequest(BaseModel):
    project_title: str
    project_description: str
    budget: Optional[float] = None
    deadline_days: Optional[int] = None


Token.model_rebuild()
