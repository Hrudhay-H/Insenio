import uuid
from datetime import datetime, timezone

from app.config import settings
from app.db.client import execute

FS = settings.full_schema


def create_application(student_id: str, lab_id: str, drafted_message: str) -> str:
    application_id = f"app_{uuid.uuid4().hex[:12]}"
    now = datetime.now(timezone.utc)
    execute(
        f"""
        INSERT INTO {FS}.applications
            (application_id, student_id, lab_id, status, drafted_message,
             no_response_flag, created_at, updated_at)
        VALUES
            (:application_id, :student_id, :lab_id, 'Applied', :drafted_message,
             FALSE, :created_at, :updated_at)
        """,
        {
            "application_id": application_id,
            "student_id": student_id,
            "lab_id": lab_id,
            "drafted_message": drafted_message,
            "created_at": now,
            "updated_at": now,
        },
    )
    return application_id


def list_applications_by_student(student_id: str) -> list[dict]:
    return execute(
        f"SELECT * FROM {FS}.applications WHERE student_id = :student_id ORDER BY created_at DESC",
        {"student_id": student_id},
    )


def get_existing_application(student_id: str, lab_id: str) -> dict | None:
    rows = execute(
        f"SELECT * FROM {FS}.applications WHERE student_id = :student_id AND lab_id = :lab_id",
        {"student_id": student_id, "lab_id": lab_id},
    )
    return rows[0] if rows else None


def get_application(application_id: str) -> dict | None:
    rows = execute(
        f"SELECT * FROM {FS}.applications WHERE application_id = :application_id",
        {"application_id": application_id},
    )
    return rows[0] if rows else None


def list_applications_by_lab(lab_id: str) -> list[dict]:
    return execute(
        f"SELECT * FROM {FS}.applications WHERE lab_id = :lab_id ORDER BY created_at DESC",
        {"lab_id": lab_id},
    )


def update_status(application_id: str, status_value: str) -> None:
    execute(
        f"""
        UPDATE {FS}.applications SET status = :status, updated_at = :updated_at
        WHERE application_id = :application_id
        """,
        {"application_id": application_id, "status": status_value, "updated_at": datetime.now(timezone.utc)},
    )


def set_no_response(application_id: str) -> None:
    execute(
        f"""
        UPDATE {FS}.applications SET no_response_flag = TRUE, updated_at = :updated_at
        WHERE application_id = :application_id
        """,
        {"application_id": application_id, "updated_at": datetime.now(timezone.utc)},
    )


def count_for_lab(lab_id: str) -> dict:
    rows = execute(
        f"""
        SELECT COUNT(*) AS total, SUM(CASE WHEN no_response_flag THEN 1 ELSE 0 END) AS no_response_count
        FROM {FS}.applications WHERE lab_id = :lab_id
        """,
        {"lab_id": lab_id},
    )
    row = rows[0] if rows else {"total": 0, "no_response_count": 0}
    return {"total": row["total"] or 0, "no_response_count": row["no_response_count"] or 0}
