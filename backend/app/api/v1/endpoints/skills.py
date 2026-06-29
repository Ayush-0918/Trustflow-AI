from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List, Dict

from app.db.session import get_db
from app.core.security import get_current_user
from app.models import User, SkillTestResult
from app.schemas import SkillTestSubmit, SkillTestResultOut
from app.services import ai_service

router = APIRouter()

PASSING_SCORE = 70  # percent

# In-memory cache for generated questions, keyed by (user_id, skill_name).
# This ensures the same questions used for display are used for grading.
# In production, use Redis or a DB table instead.
_question_cache: Dict[str, list] = {}


def _cache_key(user_id: int, skill_name: str) -> str:
    return f"{user_id}:{skill_name.lower()}"


@router.get("/{skill_name}/questions")
async def get_skill_questions(
    skill_name: str,
    current_user: User = Depends(get_current_user),
):
    try:
        questions = await ai_service.generate_skill_questions(skill_name, count=10)

        # Cache the full questions (with correct_answer) for validation on submit
        key = _cache_key(int(current_user.id), skill_name)  # type: ignore
        _question_cache[key] = questions

        # Strip correct_answer before sending to client
        sanitized = [
            {
                "id": q.get("id", f"q{i}"),
                "question": q["question"],
                "options": q["options"],
                "time_limit": q.get("time_limit", 60),
                "difficulty": q.get("difficulty", "medium"),
            }
            for i, q in enumerate(questions)
        ]
        return {"skill": skill_name, "questions": sanitized}
    except Exception as e:
        raise HTTPException(500, f"Could not generate questions: {str(e)}")


@router.post("/submit", response_model=SkillTestResultOut, status_code=201)
async def submit_skill_test(
    data: SkillTestSubmit,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # Retrieve cached questions instead of re-generating (which would give different answers)
    key = _cache_key(int(current_user.id), data.skill_name)  # type: ignore
    questions = _question_cache.pop(key, None)

    if not questions:
        # Fallback: if cache expired or server restarted, re-generate (best effort)
        questions = await ai_service.generate_skill_questions(data.skill_name, count=10)

    score = 0
    max_score = len(questions)
    for i, q in enumerate(questions):
        q_id = q.get("id", f"q{i}")
        user_answer = data.answers.get(q_id)
        correct = q.get("correct_answer")
        if user_answer is not None and correct is not None:
            try:
                if int(user_answer) == int(correct):
                    score += 1
            except (ValueError, TypeError):
                pass

    percentage = (score / max_score * 100) if max_score > 0 else 0
    passed = percentage >= PASSING_SCORE

    result = SkillTestResult(
        user_id=current_user.id,
        skill_name=data.skill_name,
        score=score,
        max_score=max_score,
        percentage=percentage,
        passed=passed,
        answers=data.answers,
    )
    db.add(result)

    # Add to user skills if passed
    if passed and data.skill_name not in (current_user.skills or []):
        current_user.skills = list(current_user.skills or []) + [data.skill_name]  # type: ignore

    await db.commit()
    await db.refresh(result)
    return result


@router.get("/my-results", response_model=List[SkillTestResultOut])
async def my_skill_results(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(SkillTestResult)
        .where(SkillTestResult.user_id == current_user.id)
        .order_by(SkillTestResult.created_at.desc())
    )
    return result.scalars().all()
