from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.db.session import get_db
from app.core.security import get_current_user
from app.models import User, Project
from app.schemas import AIPlannerRequest
from app.services import ai_service

router = APIRouter()


@router.post("/planner")
async def generate_blueprint(
    data: AIPlannerRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        blueprint = await ai_service.generate_project_blueprint(
            title=data.project_title,
            description=data.project_description,
            budget=data.budget,
            deadline_days=data.deadline_days,
        )
        return {"blueprint": blueprint}
    except Exception as e:
        raise HTTPException(500, f"AI service error: {str(e)}")


@router.post("/planner/{project_id}/save")
async def save_blueprint_to_project(
    project_id: int,
    data: AIPlannerRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(select(Project).where(Project.id == project_id))
    project = result.scalar_one_or_none()
    if not project or project.client_id != current_user.id:  # type: ignore
        raise HTTPException(404, "Project not found")

    blueprint = await ai_service.generate_project_blueprint(
        title=data.project_title,
        description=data.project_description,
        budget=data.budget,
        deadline_days=data.deadline_days,
    )
    project.ai_blueprint = blueprint  # type: ignore
    await db.commit()
    return {"blueprint": blueprint, "saved": True}


@router.post("/trust/{user_id}")
async def analyze_trust(
    user_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(404, "User not found")

    user_data = {
        "username": user.username,
        "identity_verified": user.identity_verified,
        "phone_verified": user.phone_verified,
        "skills": user.skills,
        "role": user.role,
        "is_verified": user.is_verified,
        "bio": bool(user.bio),
        "avatar": bool(user.avatar_url),
        "hourly_rate": bool(user.hourly_rate),
    }

    try:
        analysis = await ai_service.calculate_trust_score(user_data)
        # Update the user's trust score
        user.trust_score = analysis.get("overall_score", user.trust_score)
        user.trust_score_breakdown = analysis.get("breakdown", {})
        await db.commit()
        return analysis
    except Exception as e:
        raise HTTPException(500, f"AI service error: {str(e)}")


@router.post("/video/analyze")
async def analyze_video_session(
    session_description: dict,
    current_user: User = Depends(get_current_user),
):
    try:
        result = await ai_service.analyze_video_frame(
            str(session_description.get("description", ""))
        )
        return result
    except Exception as e:
        raise HTTPException(500, f"Analysis error: {str(e)}")
