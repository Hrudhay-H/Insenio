from fastapi import APIRouter, Depends, HTTPException, status

from app.agents.apply_assist import draft_application
from app.auth_deps import CurrentUser, require_pi, require_student
from app.db.applications import (
    create_application,
    get_application,
    get_existing_application,
    list_applications_by_student,
    set_no_response,
    update_status,
)
from app.db.labs import get_lab
from app.db.students import get_student_profile
from app.matching.decay import recompute_reliability
from app.models.application import ApplicationOut, ApplicationSubmit, ApplyAssistDraft, QuestionAnswer
from app.models.pi_dashboard import StatusUpdate

router = APIRouter(tags=["applications"])


def _require_profile(user: CurrentUser) -> dict:
    profile = get_student_profile(user.user_id)
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No profile yet — build one via the Genie intake chat first",
        )
    return profile


def _require_lab(lab_id: str) -> dict:
    lab = get_lab(lab_id)
    if not lab:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Lab not found")
    return lab


@router.post("/labs/{lab_id}/apply-assist", response_model=ApplyAssistDraft)
def apply_assist(lab_id: str, user: CurrentUser = Depends(require_student)):
    profile = _require_profile(user)
    lab = _require_lab(lab_id)
    draft = draft_application(profile, lab)
    return ApplyAssistDraft(
        message=draft.get("message", ""),
        answers=[QuestionAnswer(**a) for a in draft.get("answers", [])],
    )


def _format_drafted_message(message: str, answers: list[QuestionAnswer]) -> str:
    if not answers:
        return message
    qa_block = "\n\n".join(f"Q: {a.question}\nA: {a.answer}" for a in answers)
    return f"{message}\n\n---\n{qa_block}"


@router.post("/applications", response_model=ApplicationOut, status_code=status.HTTP_201_CREATED)
def submit_application(body: ApplicationSubmit, user: CurrentUser = Depends(require_student)):
    lab = _require_lab(body.lab_id)
    if get_existing_application(user.user_id, body.lab_id):
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Already applied to this lab")

    final_message = _format_drafted_message(body.message, body.answers)
    create_application(user.user_id, body.lab_id, final_message)
    saved = get_existing_application(user.user_id, body.lab_id)

    return ApplicationOut(
        application_id=saved["application_id"],
        lab_id=body.lab_id,
        lab_name=lab["lab_name"],
        status=saved["status"],
        drafted_message=saved["drafted_message"],
        no_response_flag=saved["no_response_flag"],
        created_at=str(saved["created_at"]),
        updated_at=str(saved["updated_at"]),
    )


@router.get("/applications", response_model=list[ApplicationOut])
def list_my_applications(user: CurrentUser = Depends(require_student)):
    apps = list_applications_by_student(user.user_id)
    out = []
    for app in apps:
        lab = get_lab(app["lab_id"])
        out.append(
            ApplicationOut(
                application_id=app["application_id"],
                lab_id=app["lab_id"],
                lab_name=lab["lab_name"] if lab else "(lab removed)",
                status=app["status"],
                drafted_message=app["drafted_message"],
                no_response_flag=app["no_response_flag"],
                created_at=str(app["created_at"]),
                updated_at=str(app["updated_at"]),
            )
        )
    return out


@router.put("/applications/{application_id}/status", response_model=ApplicationOut)
def update_application_status(application_id: str, body: StatusUpdate, user: CurrentUser = Depends(require_pi)):
    app = get_application(application_id)
    if not app:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Application not found")
    lab = get_lab(app["lab_id"])
    if not lab or lab.get("pi_user_id") != user.user_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not your lab")

    update_status(application_id, body.status)
    updated = get_application(application_id)
    return ApplicationOut(
        application_id=updated["application_id"],
        lab_id=updated["lab_id"],
        lab_name=lab["lab_name"],
        status=updated["status"],
        drafted_message=updated["drafted_message"],
        no_response_flag=updated["no_response_flag"],
        created_at=str(updated["created_at"]),
        updated_at=str(updated["updated_at"]),
    )


@router.post("/applications/{application_id}/no-response", status_code=status.HTTP_204_NO_CONTENT)
def report_no_response(application_id: str, user: CurrentUser = Depends(require_student)):
    app = get_application(application_id)
    if not app or app["student_id"] != user.user_id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Application not found")
    set_no_response(application_id)
    recompute_reliability(app["lab_id"])
