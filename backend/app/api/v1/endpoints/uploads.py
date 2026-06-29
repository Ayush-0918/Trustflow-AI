from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from app.core.security import get_current_user
from app.models import User
from app.services.upload_service import upload_avatar, upload_project_file
from app.db.session import get_db
from sqlalchemy.ext.asyncio import AsyncSession

router = APIRouter()

MAX_AVATAR_SIZE = 5 * 1024 * 1024   # 5 MB
MAX_FILE_SIZE   = 25 * 1024 * 1024  # 25 MB
ALLOWED_IMAGE_TYPES = {"image/jpeg", "image/png", "image/webp", "image/gif"}


@router.post("/avatar")
async def upload_user_avatar(
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if file.content_type not in ALLOWED_IMAGE_TYPES:
        raise HTTPException(400, "Only JPEG, PNG, WebP, and GIF are allowed")

    contents = await file.read()
    if len(contents) > MAX_AVATAR_SIZE:
        raise HTTPException(400, "File too large (max 5 MB)")

    url = await upload_avatar(contents, current_user.id)  # type: ignore
    current_user.avatar_url = url  # type: ignore
    await db.commit()
    return {"avatar_url": url}


@router.post("/project/{project_id}")
async def upload_project_attachment(
    project_id: int,
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
):
    contents = await file.read()
    if len(contents) > MAX_FILE_SIZE:
        raise HTTPException(400, "File too large (max 25 MB)")

    url = await upload_project_file(contents, project_id, file.filename or "attachment")
    return {"file_url": url, "filename": file.filename}
