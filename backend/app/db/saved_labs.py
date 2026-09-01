from datetime import datetime, timezone

from app.config import settings
from app.db.client import execute

FS = settings.full_schema


def is_saved(student_id: str, lab_id: str) -> bool:
    rows = execute(
        f"SELECT 1 FROM {FS}.saved_labs WHERE student_id = :student_id AND lab_id = :lab_id",
        {"student_id": student_id, "lab_id": lab_id},
    )
    return bool(rows)


def save_lab(student_id: str, lab_id: str) -> None:
    if is_saved(student_id, lab_id):
        return
    execute(
        f"INSERT INTO {FS}.saved_labs (student_id, lab_id, saved_at) VALUES (:student_id, :lab_id, :saved_at)",
        {"student_id": student_id, "lab_id": lab_id, "saved_at": datetime.now(timezone.utc)},
    )


def unsave_lab(student_id: str, lab_id: str) -> None:
    execute(
        f"DELETE FROM {FS}.saved_labs WHERE student_id = :student_id AND lab_id = :lab_id",
        {"student_id": student_id, "lab_id": lab_id},
    )


def list_saved_lab_ids(student_id: str) -> list[str]:
    rows = execute(
        f"SELECT lab_id FROM {FS}.saved_labs WHERE student_id = :student_id ORDER BY saved_at DESC",
        {"student_id": student_id},
    )
    return [row["lab_id"] for row in rows]
