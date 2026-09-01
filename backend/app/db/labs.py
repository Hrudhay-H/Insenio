import uuid
from datetime import datetime, timezone

from app.config import settings
from app.db.client import execute, get_connection

FS = settings.full_schema


def _attach_required_skills(labs: list[dict]) -> list[dict]:
    if not labs:
        return []
    lab_ids = [lab["lab_id"] for lab in labs]
    placeholders = ", ".join(f":id{i}" for i in range(len(lab_ids)))
    params = {f"id{i}": lab_id for i, lab_id in enumerate(lab_ids)}
    rows = execute(
        f"SELECT lab_id, skill_name, depth FROM {FS}.lab_required_skills WHERE lab_id IN ({placeholders})",
        params,
    )
    by_lab: dict[str, list[dict]] = {}
    for row in rows:
        by_lab.setdefault(row["lab_id"], []).append({"skill_name": row["skill_name"], "depth": row["depth"]})
    for lab in labs:
        lab["required_skills"] = by_lab.get(lab["lab_id"], [])
    return labs


def get_lab(lab_id: str) -> dict | None:
    rows = execute(f"SELECT * FROM {FS}.labs WHERE lab_id = :lab_id", {"lab_id": lab_id})
    if not rows:
        return None
    return _attach_required_skills(rows)[0]


def list_labs(search: str | None = None, taking_students: bool | None = None) -> list[dict]:
    query = f"SELECT * FROM {FS}.labs WHERE 1=1"
    params: dict = {}
    if search:
        query += """ AND (
            lower(lab_name) LIKE :search
            OR lower(research_focus) LIKE :search
            OR lab_id IN (
                SELECT lab_id FROM {fs}.lab_required_skills WHERE lower(skill_name) LIKE :search
            )
        )""".format(fs=FS)
        params["search"] = f"%{search.lower()}%"
    if taking_students:
        query += " AND current_team_size < capacity"
    query += " ORDER BY last_updated DESC"
    return _attach_required_skills(execute(query, params))


def list_labs_by_pi(pi_user_id: str) -> list[dict]:
    rows = execute(
        f"SELECT * FROM {FS}.labs WHERE pi_user_id = :pi_user_id ORDER BY last_updated DESC",
        {"pi_user_id": pi_user_id},
    )
    return _attach_required_skills(rows)


def create_lab(pi_user_id: str, pi_name: str, lab_name: str, research_focus: str, time_commitment_hrs: int,
               capacity: int, recent_publications: str | None, application_questions: list[str],
               required_skills: list[dict]) -> str:
    lab_id = f"lab_{uuid.uuid4().hex[:10]}"
    now = datetime.now(timezone.utc)
    with get_connection() as conn:
        with conn.cursor() as cursor:
            cursor.execute(
                f"""
                INSERT INTO {FS}.labs
                    (lab_id, lab_name, pi_name, pi_user_id, research_focus, time_commitment_hrs,
                     capacity, current_team_size, recent_publications, application_questions,
                     reliability_score, last_updated)
                VALUES
                    (:lab_id, :lab_name, :pi_name, :pi_user_id, :research_focus, :time_commitment_hrs,
                     :capacity, 0, :recent_publications, :application_questions, 1.0, :last_updated)
                """,
                {
                    "lab_id": lab_id,
                    "lab_name": lab_name,
                    "pi_name": pi_name,
                    "pi_user_id": pi_user_id,
                    "research_focus": research_focus,
                    "time_commitment_hrs": time_commitment_hrs,
                    "capacity": capacity,
                    "recent_publications": recent_publications,
                    "application_questions": "|".join(application_questions) if application_questions else None,
                    "last_updated": now,
                },
            )
            for skill in required_skills:
                cursor.execute(
                    f"""
                    INSERT INTO {FS}.lab_required_skills (lab_id, skill_name, depth)
                    VALUES (:lab_id, :skill_name, :depth)
                    """,
                    {"lab_id": lab_id, "skill_name": skill["skill_name"], "depth": skill["depth"]},
                )
    return lab_id


def update_lab(lab_id: str, research_focus: str | None, time_commitment_hrs: int | None, capacity: int | None,
                current_team_size: int | None, recent_publications: str | None,
                application_questions: list[str] | None,
                required_skills: list[dict] | None) -> None:
    existing = get_lab(lab_id)
    if not existing:
        return
    now = datetime.now(timezone.utc)
    new_questions = (
        "|".join(application_questions) if application_questions else existing.get("application_questions")
    )
    with get_connection() as conn:
        with conn.cursor() as cursor:
            cursor.execute(
                f"""
                UPDATE {FS}.labs SET
                    research_focus = :research_focus,
                    time_commitment_hrs = :time_commitment_hrs,
                    capacity = :capacity,
                    current_team_size = :current_team_size,
                    recent_publications = :recent_publications,
                    application_questions = :application_questions,
                    last_updated = :last_updated
                WHERE lab_id = :lab_id
                """,
                {
                    "lab_id": lab_id,
                    "research_focus": research_focus if research_focus is not None else existing["research_focus"],
                    "time_commitment_hrs": (
                        time_commitment_hrs if time_commitment_hrs is not None else existing["time_commitment_hrs"]
                    ),
                    "capacity": capacity if capacity is not None else existing["capacity"],
                    "current_team_size": (
                        current_team_size if current_team_size is not None else existing["current_team_size"]
                    ),
                    "recent_publications": (
                        recent_publications if recent_publications is not None else existing["recent_publications"]
                    ),
                    "application_questions": new_questions,
                    "last_updated": now,
                },
            )
            if required_skills is not None:
                cursor.execute(f"DELETE FROM {FS}.lab_required_skills WHERE lab_id = :lab_id", {"lab_id": lab_id})
                for skill in required_skills:
                    cursor.execute(
                        f"""
                        INSERT INTO {FS}.lab_required_skills (lab_id, skill_name, depth)
                        VALUES (:lab_id, :skill_name, :depth)
                        """,
                        {"lab_id": lab_id, "skill_name": skill["skill_name"], "depth": skill["depth"]},
                    )
