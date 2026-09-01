from datetime import datetime, timezone

from app.config import settings
from app.db.client import execute, get_connection

FS = settings.full_schema


def list_all_student_ids() -> list[str]:
    rows = execute(f"SELECT student_id FROM {FS}.student_profiles")
    return [row["student_id"] for row in rows]


def get_student_profile(student_id: str) -> dict | None:
    profiles = execute(
        f"SELECT * FROM {FS}.student_profiles WHERE student_id = :student_id",
        {"student_id": student_id},
    )
    if not profiles:
        return None
    profile = profiles[0]
    profile["skills"] = execute(
        f"SELECT skill_name, proficiency FROM {FS}.student_skills WHERE student_id = :student_id",
        {"student_id": student_id},
    )
    return profile


def upsert_student_profile(
    student_id: str,
    academic_year: str | None,
    major: str | None,
    availability_hrs: int | None,
    interests_text: str | None,
    interest_tags: str | None,
) -> None:
    execute(
        f"""
        MERGE INTO {FS}.student_profiles AS target
        USING (
            SELECT
                :student_id AS student_id,
                :academic_year AS academic_year,
                :major AS major,
                :availability_hrs AS availability_hrs,
                :interests_text AS interests_text,
                :interest_tags AS interest_tags,
                :last_updated AS last_updated
        ) AS source
        ON target.student_id = source.student_id
        WHEN MATCHED THEN UPDATE SET
            academic_year = source.academic_year,
            major = source.major,
            availability_hrs = source.availability_hrs,
            interests_text = source.interests_text,
            interest_tags = source.interest_tags,
            last_updated = source.last_updated
        WHEN NOT MATCHED THEN INSERT (
            student_id, academic_year, major, availability_hrs,
            interests_text, interest_tags, last_updated
        ) VALUES (
            source.student_id, source.academic_year, source.major, source.availability_hrs,
            source.interests_text, source.interest_tags, source.last_updated
        )
        """,
        {
            "student_id": student_id,
            "academic_year": academic_year,
            "major": major,
            "availability_hrs": availability_hrs,
            "interests_text": interests_text,
            "interest_tags": interest_tags,
            "last_updated": datetime.now(timezone.utc),
        },
    )


def replace_student_skills(student_id: str, skills: list[dict]) -> None:
    """skills: [{"skill_name": str, "proficiency": str}, ...] — full replace."""
    with get_connection() as conn:
        with conn.cursor() as cursor:
            cursor.execute(
                f"DELETE FROM {FS}.student_skills WHERE student_id = :student_id",
                {"student_id": student_id},
            )
            for skill in skills:
                cursor.execute(
                    f"""
                    INSERT INTO {FS}.student_skills (student_id, skill_name, proficiency)
                    VALUES (:student_id, :skill_name, :proficiency)
                    """,
                    {
                        "student_id": student_id,
                        "skill_name": skill["skill_name"],
                        "proficiency": skill["proficiency"],
                    },
                )
