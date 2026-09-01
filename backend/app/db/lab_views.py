from datetime import datetime, timezone

from app.config import settings
from app.db.client import execute

FS = settings.full_schema


def record_view(lab_id: str, student_id: str) -> None:
    execute(
        f"INSERT INTO {FS}.lab_views (lab_id, student_id, viewed_at) VALUES (:lab_id, :student_id, :viewed_at)",
        {"lab_id": lab_id, "student_id": student_id, "viewed_at": datetime.now(timezone.utc)},
    )


def get_view_stats(lab_id: str) -> dict:
    rows = execute(
        f"""
        SELECT COUNT(*) AS total_views, COUNT(DISTINCT student_id) AS unique_viewers
        FROM {FS}.lab_views WHERE lab_id = :lab_id
        """,
        {"lab_id": lab_id},
    )
    return rows[0] if rows else {"total_views": 0, "unique_viewers": 0}
