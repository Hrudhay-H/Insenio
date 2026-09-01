from fastapi import APIRouter, Depends, HTTPException, status

from app.auth_deps import CurrentUser, get_current_user_optional, require_pi, require_student
from app.db.lab_views import record_view
from app.db.labs import create_lab, get_lab, list_labs, list_labs_by_pi, update_lab
from app.db.saved_labs import is_saved, list_saved_lab_ids, save_lab, unsave_lab
from app.db.users import get_user_by_id
from app.matching.semantic import trigger_index_sync
from app.models.lab import LabCreate, LabOut, LabUpdate, RequiredSkillItem

router = APIRouter(prefix="/labs", tags=["labs"])


def _to_out(lab: dict, saved: bool = False) -> LabOut:
    return LabOut(
        lab_id=lab["lab_id"],
        lab_name=lab["lab_name"],
        pi_name=lab["pi_name"],
        pi_user_id=lab.get("pi_user_id"),
        research_focus=lab["research_focus"],
        time_commitment_hrs=lab["time_commitment_hrs"],
        capacity=lab["capacity"],
        current_team_size=lab["current_team_size"],
        recent_publications=lab.get("recent_publications"),
        application_questions=(
            [q for q in (lab.get("application_questions") or "").split("|") if q.strip()]
        ),
        reliability_score=round(lab["reliability_score"], 3),
        last_updated=str(lab["last_updated"]),
        required_skills=[RequiredSkillItem(**s) for s in lab.get("required_skills", [])],
        saved=saved,
    )


@router.get("", response_model=list[LabOut])
def browse_labs(
    search: str | None = None,
    taking_students: bool = False,
    user: CurrentUser | None = Depends(get_current_user_optional),
):
    labs = list_labs(search=search, taking_students=taking_students if taking_students else None)
    saved_ids = set(list_saved_lab_ids(user.user_id)) if user and user.role == "student" else set()
    return [_to_out(lab, saved=lab["lab_id"] in saved_ids) for lab in labs]


@router.get("/mine", response_model=list[LabOut])
def my_labs(user: CurrentUser = Depends(require_pi)):
    return [_to_out(lab) for lab in list_labs_by_pi(user.user_id)]


@router.get("/saved/list", response_model=list[LabOut])
def saved_labs_list(user: CurrentUser = Depends(require_student)):
    labs = [get_lab(lab_id) for lab_id in list_saved_lab_ids(user.user_id)]
    return [_to_out(lab, saved=True) for lab in labs if lab]


@router.get("/{lab_id}", response_model=LabOut)
def lab_detail(lab_id: str, user: CurrentUser | None = Depends(get_current_user_optional)):
    lab = get_lab(lab_id)
    if not lab:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Lab not found")
    saved = is_saved(user.user_id, lab_id) if user and user.role == "student" else False
    if user and user.role == "student":
        record_view(lab_id, user.user_id)
    return _to_out(lab, saved=saved)


@router.post("", response_model=LabOut, status_code=status.HTTP_201_CREATED)
def post_lab(body: LabCreate, user: CurrentUser = Depends(require_pi)):
    pi_user = get_user_by_id(user.user_id)
    lab_id = create_lab(
        pi_user_id=user.user_id,
        pi_name=pi_user["email"].split("@")[0] if pi_user else "Unknown PI",
        lab_name=body.lab_name,
        research_focus=body.research_focus,
        time_commitment_hrs=body.time_commitment_hrs,
        capacity=body.capacity,
        recent_publications=body.recent_publications,
        application_questions=body.application_questions,
        required_skills=[s.model_dump() for s in body.required_skills],
    )
    trigger_index_sync()
    return _to_out(get_lab(lab_id))


@router.put("/{lab_id}", response_model=LabOut)
def put_lab(lab_id: str, body: LabUpdate, user: CurrentUser = Depends(require_pi)):
    lab = get_lab(lab_id)
    if not lab:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Lab not found")
    if lab.get("pi_user_id") != user.user_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not your lab")

    update_lab(
        lab_id=lab_id,
        research_focus=body.research_focus,
        time_commitment_hrs=body.time_commitment_hrs,
        capacity=body.capacity,
        current_team_size=body.current_team_size,
        recent_publications=body.recent_publications,
        application_questions=body.application_questions,
        required_skills=[s.model_dump() for s in body.required_skills] if body.required_skills is not None else None,
    )
    if body.research_focus is not None:
        trigger_index_sync()
    return _to_out(get_lab(lab_id))


@router.post("/{lab_id}/save", status_code=status.HTTP_204_NO_CONTENT)
def post_save(lab_id: str, user: CurrentUser = Depends(require_student)):
    if not get_lab(lab_id):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Lab not found")
    save_lab(user.user_id, lab_id)


@router.delete("/{lab_id}/save", status_code=status.HTTP_204_NO_CONTENT)
def delete_save(lab_id: str, user: CurrentUser = Depends(require_student)):
    unsave_lab(user.user_id, lab_id)
