from fastapi import APIRouter, Depends
from app.core.security import get_current_user
from app.models import User

router = APIRouter()

@router.get("/score")
async def get_trust_score(current_user: User = Depends(get_current_user)):
    return {
        "user_id": current_user.id,
        "overall_score": current_user.trust_score,
        "breakdown": current_user.trust_score_breakdown or {},
        "identity_verified": current_user.identity_verified,
        "phone_verified": current_user.phone_verified,
    }
