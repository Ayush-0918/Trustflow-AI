from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from typing import List, Optional

from app.db.session import get_db
from app.core.security import get_current_user
from app.models import User, Project
from app.schemas import ProjectCreate, ProjectOut, ProjectUpdate

router = APIRouter()


@router.post("", response_model=ProjectOut, status_code=201)
async def create_project(
    data: ProjectCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    project = Project(**data.model_dump(), client_id=current_user.id)
    db.add(project)
    await db.commit()
    await db.refresh(project)
    return project


@router.get("", response_model=List[ProjectOut])
async def list_projects(
    status: Optional[str] = None,
    skill: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = (
        select(Project)
        .options(selectinload(Project.client), selectinload(Project.freelancer))
        .order_by(Project.created_at.desc())
    )

    if status:
        query = query.where(Project.status == status)

    result = await db.execute(query)
    return result.scalars().all()


@router.get("/my", response_model=List[ProjectOut])
async def my_projects(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = (
        select(Project)
        .options(selectinload(Project.client), selectinload(Project.freelancer))
        .where(
            (Project.client_id == current_user.id)
            | (Project.freelancer_id == current_user.id)
        )
        .order_by(Project.created_at.desc())
    )
    result = await db.execute(query)
    return result.scalars().all()


@router.get("/{project_id}", response_model=ProjectOut)
async def get_project(
    project_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(Project)
        .options(
            selectinload(Project.client),
            selectinload(Project.freelancer),
            selectinload(Project.milestones),
        )
        .where(Project.id == project_id)
    )
    project = result.scalar_one_or_none()
    if not project:
        raise HTTPException(404, "Project not found")
    return project


@router.patch("/{project_id}", response_model=ProjectOut)
async def update_project(
    project_id: int,
    data: ProjectUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(select(Project).where(Project.id == project_id))
    project = result.scalar_one_or_none()
    if not project:
        raise HTTPException(404, "Project not found")
    if project.client_id != current_user.id:  # type: ignore
        raise HTTPException(403, "Not authorized")

    for field, value in data.model_dump(exclude_none=True).items():
        setattr(project, field, value)

    await db.commit()
    await db.refresh(project)
    return project
