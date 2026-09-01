from fastapi import APIRouter, Depends, HTTPException, status

from app.auth_deps import CurrentUser, require_student
from app.db.students import get_student_profile
from app.matching.engine import match_student_to_labs
from app.models.match import LabMatchOut, SkillGapOut

router = APIRouter(prefix="/matches", tags=["matches"])


def _to_out(m) -> LabMatchOut:
    return LabMatchOut(
        lab_id=m.lab_id,
        lab_name=m.lab_name,
        pi_name=m.pi_name,
        research_focus=m.research_focus,
        time_commitment_hrs=m.time_commitment_hrs,
        capacity=m.capacity,
        current_team_size=m.current_team_size,
        reliability_score=m.reliability_score,
        last_updated=m.last_updated,
        matched_skills=m.matched_skills,
        missing_skills=[SkillGapOut(skill_name=g.skill_name, required_depth=g.required_depth) for g in m.missing_skills],
        skill_overlap_ratio=round(m.skill_overlap_ratio, 3),
        availability_fits=m.availability_fits,
        capacity_open=m.capacity_open,
        interest_alignment_score=round(m.interest_alignment_score, 3),
        interest_alignment_method=m.interest_alignment_method,
        matched_interests=m.matched_interests,
        label=m.label,
        reasons=m.reasons,
    )


def _student_context(user: CurrentUser) -> tuple[list[dict], int | None, list[str], str | None]:
    profile = get_student_profile(user.user_id)
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No profile yet — build one via the Genie intake chat first",
        )
    tags = [t.strip() for t in (profile.get("interest_tags") or "").split(",") if t.strip()]
    return profile.get("skills", []), profile.get("availability_hrs"), tags, profile.get("interests_text")


@router.get("", response_model=list[LabMatchOut])
def list_matches(user: CurrentUser = Depends(require_student)):
    skills, availability_hrs, tags, interests_text = _student_context(user)
    matches = match_student_to_labs(user.user_id, skills, availability_hrs, tags, interests_text)
    return [_to_out(m) for m in matches]


@router.get("/{lab_id}", response_model=LabMatchOut)
def get_match(lab_id: str, user: CurrentUser = Depends(require_student)):
    skills, availability_hrs, tags, interests_text = _student_context(user)
    matches = match_student_to_labs(user.user_id, skills, availability_hrs, tags, interests_text, lab_id=lab_id)
    if not matches:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Lab not found")
    return _to_out(matches[0])
