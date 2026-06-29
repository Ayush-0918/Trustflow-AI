from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List

from app.db.session import get_db
from app.core.security import get_current_user
from app.models import User, Project, Milestone
from app.schemas import MilestoneCreate, MilestoneOut

router = APIRouter()

@router.post("", response_model=MilestoneOut, status_code=201)
async def create_milestone(
    project_id: int,
    data: MilestoneCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(select(Project).where(Project.id == project_id))
    project = result.scalar_one_or_none()
    if not project or project.client_id != current_user.id:  # type: ignore
        raise HTTPException(403, "Not authorized")
    milestone = Milestone(project_id=project_id, **data.model_dump())
    db.add(milestone)
    await db.commit()
    await db.refresh(milestone)
    return milestone

@router.get("", response_model=List[MilestoneOut])
async def list_milestones(project_id: int, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    result = await db.execute(select(Milestone).where(Milestone.project_id == project_id))
    return result.scalars().all()

@router.patch("/{milestone_id}/approve", response_model=MilestoneOut)
async def approve_milestone(project_id: int, milestone_id: int, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    result = await db.execute(select(Milestone).where(Milestone.id == milestone_id, Milestone.project_id == project_id))
    milestone = result.scalar_one_or_none()
    if not milestone:
        raise HTTPException(404, "Milestone not found")
    milestone.status = "approved"  # type: ignore
    await db.commit()
    await db.refresh(milestone)
    return milestone
