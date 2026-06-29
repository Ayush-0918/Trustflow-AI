import cloudinary
import cloudinary.uploader
from app.core.config import settings

cloudinary.config(
    cloud_name=settings.CLOUDINARY_CLOUD_NAME,
    api_key=settings.CLOUDINARY_API_KEY,
    api_secret=settings.CLOUDINARY_API_SECRET,
    secure=True,
)


async def upload_avatar(file_bytes: bytes, user_id: int) -> str:
    """Upload a user avatar and return the secure URL."""
    result = cloudinary.uploader.upload(
        file_bytes,
        public_id=f"trustflow/avatars/user_{user_id}",
        overwrite=True,
        transformation=[
            {"width": 400, "height": 400, "crop": "fill", "gravity": "face"},
            {"quality": "auto", "fetch_format": "auto"},
        ],
    )
    return result["secure_url"]


async def upload_project_file(file_bytes: bytes, project_id: int, filename: str) -> str:
    """Upload a project file and return the secure URL."""
    result = cloudinary.uploader.upload(
        file_bytes,
        public_id=f"trustflow/projects/{project_id}/{filename}",
        resource_type="auto",
    )
    return result["secure_url"]
