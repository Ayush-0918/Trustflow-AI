from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from typing import List

from app.db.session import get_db
from app.core.security import get_current_user
from app.models import User, Message
from app.schemas import MessageCreate, MessageOut

router = APIRouter()

@router.post("", response_model=MessageOut, status_code=201)
async def send_message(project_id: int, data: MessageCreate, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    msg = Message(project_id=project_id, sender_id=current_user.id, **data.model_dump())
    db.add(msg)
    await db.commit()
    await db.refresh(msg)
    return msg

@router.get("", response_model=List[MessageOut])
async def get_messages(project_id: int, limit: int = 50, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    result = await db.execute(
        select(Message).options(selectinload(Message.sender))
        .where(Message.project_id == project_id)
        .order_by(Message.created_at.desc()).limit(limit)
    )
    return list(reversed(result.scalars().all()))
