from fastapi import APIRouter
from app.api.v1.endpoints import (
    auth, users, projects, milestones,
    messages, wallet, trust, skills, ai, webhooks, uploads
)

api_router = APIRouter()

api_router.include_router(auth.router,       prefix="/auth",                                    tags=["auth"])
api_router.include_router(users.router,      prefix="/users",                                   tags=["users"])
api_router.include_router(projects.router,   prefix="/projects",                                tags=["projects"])
api_router.include_router(milestones.router, prefix="/projects/{project_id}/milestones",        tags=["milestones"])
api_router.include_router(messages.router,   prefix="/projects/{project_id}/messages",          tags=["messages"])
api_router.include_router(wallet.router,     prefix="/wallet",                                  tags=["wallet"])
api_router.include_router(trust.router,      prefix="/trust",                                   tags=["trust"])
api_router.include_router(skills.router,     prefix="/skills",                                  tags=["skills"])
api_router.include_router(ai.router,         prefix="/ai",                                      tags=["ai"])
api_router.include_router(webhooks.router,   prefix="/webhooks",                                tags=["webhooks"])
api_router.include_router(uploads.router,    prefix="/uploads",                                 tags=["uploads"])
