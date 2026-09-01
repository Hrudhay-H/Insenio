from fastapi import APIRouter, Depends, HTTPException, status

from app.auth_deps import CurrentUser, require_pi
from app.db.applications import list_applications_by_lab
from app.db.lab_views import get_view_stats
from app.db.labs import get_lab
from app.db.students import get_student_profile
from app.matching.engine import count_strong_matches_for_lab, match_student_to_labs
from app.models.match import SkillGapOut
from app.models.pi_dashboard import ApplicantOut, LabStatsOut

router = APIRouter(prefix="/labs", tags=["pi-dashboard"])


def _require_owned_lab(lab_id: str, user: CurrentUser) -> dict:
    lab = get_lab(lab_id)
    if not lab:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Lab not found")
    if lab.get("pi_user_id") != user.user_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not your lab")
    return lab


@router.get("/{lab_id}/applicants", response_model=list[ApplicantOut])
def get_applicants(lab_id: str, user: CurrentUser = Depends(require_pi)):
    _require_owned_lab(lab_id, user)
    applications = list_applications_by_lab(lab_id)

    out = []
    for app in applications:
        profile = get_student_profile(app["student_id"])
        matched_skills, missing_skills, skill_ratio = [], [], 0.0
        if profile:
            tags = [t.strip() for t in (profile.get("interest_tags") or "").split(",") if t.strip()]
            matches = match_student_to_labs(
                app["student_id"],
                profile.get("skills", []),
                profile.get("availability_hrs"),
                tags,
                profile.get("interests_text"),
                lab_id=lab_id,
            )
            if matches:
                m = matches[0]
                matched_skills = m.matched_skills
                missing_skills = [SkillGapOut(skill_name=g.skill_name, required_depth=g.required_depth) for g in m.missing_skills]
                skill_ratio = round(m.skill_overlap_ratio, 3)

        out.append(
            ApplicantOut(
                application_id=app["application_id"],
                student_id=app["student_id"],
                status=app["status"],
                drafted_message=app["drafted_message"],
                no_response_flag=app["no_response_flag"],
                created_at=str(app["created_at"]),
                updated_at=str(app["updated_at"]),
                matched_skills=matched_skills,
                missing_skills=missing_skills,
                skill_overlap_ratio=skill_ratio,
            )
        )
    return out


@router.get("/{lab_id}/stats", response_model=LabStatsOut)
def get_lab_stats(lab_id: str, user: CurrentUser = Depends(require_pi)):
    lab = _require_owned_lab(lab_id, user)
    views = get_view_stats(lab_id)
    strong_matches = count_strong_matches_for_lab(lab_id)
    return LabStatsOut(
        lab_id=lab_id,
        total_views=views["total_views"],
        unique_viewers=views["unique_viewers"],
        strong_matches=strong_matches,
        reliability_score=round(lab["reliability_score"], 3),
    )
