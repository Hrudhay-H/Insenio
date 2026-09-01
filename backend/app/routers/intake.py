from fastapi import APIRouter, Depends, HTTPException, UploadFile, status

from app.agents.intake_agent import SCOPE_REDIRECT_MESSAGE, _missing_fields, extract_profile, get_reply, is_in_scope
from app.agents.resume_agent import extract_from_resume, extract_text_from_upload
from app.auth_deps import CurrentUser, require_student
from app.db.students import get_student_profile, replace_student_skills, upsert_student_profile
from app.models.intake import IntakeChatRequest, IntakeChatResponse
from app.routers.profile import _to_out

router = APIRouter(prefix="/genie/intake", tags=["intake"])

MAX_RESUME_BYTES = 5 * 1024 * 1024


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
    "display_name": None,
    "academic_year": None,
    "major": None,
    "availability_hrs": None,
    "interests_text": None,
    "interest_tags": None,
    "skills": [],
    "portfolio_url": None,
    "experience_text": None,
    "last_updated": None,
}


@router.post("/chat", response_model=IntakeChatResponse)
def intake_chat(body: IntakeChatRequest, user: CurrentUser = Depends(require_student)):
    messages = [m.model_dump() for m in body.messages]
    existing = get_student_profile(user.user_id)

    if not is_in_scope(messages):
        shown = existing or {**_EMPTY_PROFILE, "student_id": user.user_id}
        return IntakeChatResponse(reply=SCOPE_REDIRECT_MESSAGE, profile=_to_out(shown))

    extracted = extract_profile(messages)
    merged = _merge_profile(existing, extracted)
    reply = get_reply(messages, merged)

    upsert_student_profile(
        student_id=user.user_id,
        academic_year=merged["academic_year"],
        major=merged["major"],
        availability_hrs=merged["availability_hrs"],
        interests_text=merged["interests_text"],
        interest_tags=",".join(merged["interest_tags"]),
        portfolio_url=(existing or {}).get("portfolio_url"),
        experience_text=(existing or {}).get("experience_text"),
    )
    replace_student_skills(user.user_id, merged["skills"])

    updated_profile = get_student_profile(user.user_id)
    return IntakeChatResponse(reply=reply, profile=_to_out(updated_profile))


@router.post("/resume", response_model=IntakeChatResponse)
async def intake_resume(file: UploadFile, user: CurrentUser = Depends(require_student)):
    content = await file.read()
    if len(content) > MAX_RESUME_BYTES:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="File too large (5MB max)")

    try:
        text = extract_text_from_upload(file.filename or "", file.content_type, content)
        extracted = extract_from_resume(text)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

    existing = get_student_profile(user.user_id)
    merged = _merge_profile(existing, extracted)
    experience_text = extracted.get("experience_text") or (existing or {}).get("experience_text")

    upsert_student_profile(
        student_id=user.user_id,
        academic_year=merged["academic_year"],
        major=merged["major"],
        availability_hrs=merged["availability_hrs"],
        interests_text=merged["interests_text"],
        interest_tags=",".join(merged["interest_tags"]),
        portfolio_url=(existing or {}).get("portfolio_url"),
        experience_text=experience_text,
    )
    replace_student_skills(user.user_id, merged["skills"])

    updated_profile = get_student_profile(user.user_id)
    missing = _missing_fields(_to_out(updated_profile).model_dump())
    reply = (
        "I've read your resume and updated your profile. "
        + (f"Still missing: {', '.join(missing)} — feel free to fill those in here." if missing else "Everything I need is there — you're all set.")
    )
    return IntakeChatResponse(reply=reply, profile=_to_out(updated_profile))
