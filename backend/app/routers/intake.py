from fastapi import APIRouter, Depends

from app.agents.intake_agent import SCOPE_REDIRECT_MESSAGE, extract_profile, get_reply, is_in_scope
from app.auth_deps import CurrentUser, require_student
from app.db.students import get_student_profile, replace_student_skills, upsert_student_profile
from app.models.intake import IntakeChatRequest, IntakeChatResponse
from app.routers.profile import _to_out

router = APIRouter(prefix="/genie/intake", tags=["intake"])


def _merge_profile(existing: dict | None, extracted: dict) -> dict:
    existing = existing or {}
    existing_tags = [t.strip() for t in (existing.get("interest_tags") or "").split(",") if t.strip()]
    new_tags = extracted.get("interest_tags") or []
    merged_tags = list(dict.fromkeys([*existing_tags, *new_tags]))  # union, order-preserving

    skills_by_name = {s["skill_name"]: s["proficiency"] for s in existing.get("skills", [])}
    for skill in extracted.get("skills") or []:
        skills_by_name[skill["skill_name"]] = skill["proficiency"]

    return {
        "academic_year": extracted.get("academic_year") or existing.get("academic_year"),
        "major": extracted.get("major") or existing.get("major"),
        "availability_hrs": extracted.get("availability_hrs") or existing.get("availability_hrs"),
        "interests_text": extracted.get("interests_text") or existing.get("interests_text"),
        "interest_tags": merged_tags,
        "skills": [{"skill_name": name, "proficiency": prof} for name, prof in skills_by_name.items()],
    }


_EMPTY_PROFILE = {
    "student_id": None,
    "academic_year": None,
    "major": None,
    "availability_hrs": None,
    "interests_text": None,
    "interest_tags": None,
    "skills": [],
    "last_updated": None,
}


@router.post("/chat", response_model=IntakeChatResponse)
def intake_chat(body: IntakeChatRequest, user: CurrentUser = Depends(require_student)):
    messages = [m.model_dump() for m in body.messages]
    existing = get_student_profile(user.user_id)

    if not is_in_scope(messages):
        shown = existing or {**_EMPTY_PROFILE, "student_id": user.user_id}
        return IntakeChatResponse(reply=SCOPE_REDIRECT_MESSAGE, profile=_to_out(shown))

    reply = get_reply(messages)
    extracted = extract_profile(messages)
    merged = _merge_profile(existing, extracted)

    upsert_student_profile(
        student_id=user.user_id,
        academic_year=merged["academic_year"],
        major=merged["major"],
        availability_hrs=merged["availability_hrs"],
        interests_text=merged["interests_text"],
        interest_tags=",".join(merged["interest_tags"]),
    )
    replace_student_skills(user.user_id, merged["skills"])

    updated_profile = get_student_profile(user.user_id)
    return IntakeChatResponse(reply=reply, profile=_to_out(updated_profile))
