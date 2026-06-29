from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List

from app.db.session import get_db
from app.core.security import get_current_user
from app.models import User, SkillTestResult
from app.schemas import SkillTestSubmit, SkillTestResultOut
from app.services import ai_service

router = APIRouter()

PASSING_SCORE = 70  # percent


@router.get("/{skill_name}/questions")
async def get_skill_questions(
    skill_name: str,
    current_user: User = Depends(get_current_user),
):
    try:
        questions = await ai_service.generate_skill_questions(skill_name, count=10)
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
        return {"skill": skill_name, "questions": sanitized, "_raw": questions}
    except Exception as e:
        raise HTTPException(500, f"Could not generate questions: {str(e)}")


@router.post("/submit", response_model=SkillTestResultOut, status_code=201)
async def submit_skill_test(
    data: SkillTestSubmit,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # Generate fresh questions to validate answers
    questions = await ai_service.generate_skill_questions(data.skill_name, count=10)

    score = 0
    max_score = len(questions)
    for i, q in enumerate(questions):
        q_id = q.get("id", f"q{i}")
        user_answer = data.answers.get(q_id)
        correct = q.get("correct_answer")
        if user_answer is not None and int(user_answer) == int(correct):
            score += 1

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
