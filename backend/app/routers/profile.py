from fastapi import APIRouter, Depends, HTTPException, status

from app.auth_deps import CurrentUser, require_student
from app.db.students import get_student_profile, replace_student_skills, upsert_student_profile
from app.db.users import update_display_name
from app.models.profile import StudentProfileOut, StudentProfileUpdate

router = APIRouter(prefix="/students", tags=["profile"])


def _to_out(profile: dict) -> StudentProfileOut:
    tags = profile["interest_tags"].split(",") if profile.get("interest_tags") else []
    return StudentProfileOut(
        student_id=profile["student_id"],
        display_name=profile.get("display_name"),
        academic_year=profile.get("academic_year"),
        major=profile.get("major"),
        availability_hrs=profile.get("availability_hrs"),
        interests_text=profile.get("interests_text"),
        interest_tags=[t.strip() for t in tags if t.strip()],
        skills=profile.get("skills", []),
        portfolio_url=profile.get("portfolio_url"),
        experience_text=profile.get("experience_text"),
        last_updated=str(profile["last_updated"]) if profile.get("last_updated") else None,
    )


@router.get("/me", response_model=StudentProfileOut)
def get_my_profile(user: CurrentUser = Depends(require_student)):
    profile = get_student_profile(user.user_id)
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No profile yet — build one via the Genie intake chat first",
        )
    return _to_out(profile)


@router.put("/me", response_model=StudentProfileOut)
def update_my_profile(body: StudentProfileUpdate, user: CurrentUser = Depends(require_student)):
    existing = get_student_profile(user.user_id) or {}

    upsert_student_profile(
        student_id=user.user_id,
        academic_year=body.academic_year if body.academic_year is not None else existing.get("academic_year"),
        major=body.major if body.major is not None else existing.get("major"),
        availability_hrs=(
            body.availability_hrs if body.availability_hrs is not None else existing.get("availability_hrs")
        ),
        interests_text=(
            body.interests_text if body.interests_text is not None else existing.get("interests_text")
        ),
        interest_tags=(
            ",".join(body.interest_tags) if body.interest_tags is not None else existing.get("interest_tags")
        ),
        portfolio_url=body.portfolio_url if body.portfolio_url is not None else existing.get("portfolio_url"),
        experience_text=(
            body.experience_text if body.experience_text is not None else existing.get("experience_text")
        ),
    )

    if body.display_name is not None:
        update_display_name(user.user_id, body.display_name)

    if body.skills is not None:
        replace_student_skills(user.user_id, [s.model_dump() for s in body.skills])

    return _to_out(get_student_profile(user.user_id))
