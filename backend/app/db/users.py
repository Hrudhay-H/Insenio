import uuid
from datetime import datetime, timezone

from app.config import settings
from app.db.client import execute

FS = settings.full_schema


def get_user_by_email(email: str) -> dict | None:
    rows = execute(f"SELECT * FROM {FS}.users WHERE email = :email", {"email": email})
    return rows[0] if rows else None


def get_user_by_id(user_id: str) -> dict | None:
    rows = execute(f"SELECT * FROM {FS}.users WHERE user_id = :user_id", {"user_id": user_id})
    return rows[0] if rows else None


def create_user(email: str, password_hash: str, role: str, display_name: str | None = None) -> dict:
    user_id = f"{role}_{uuid.uuid4().hex[:12]}"
    execute(
        f"""
        INSERT INTO {FS}.users (user_id, email, password_hash, role, display_name, created_at)
        VALUES (:user_id, :email, :password_hash, :role, :display_name, :created_at)
        """,
        {
            "user_id": user_id,
            "email": email,
            "password_hash": password_hash,
            "role": role,
            "display_name": display_name,
            "created_at": datetime.now(timezone.utc),
        },
    )
    return {"user_id": user_id, "email": email, "role": role, "display_name": display_name}


def update_display_name(user_id: str, display_name: str) -> None:
    execute(
        f"UPDATE {FS}.users SET display_name = :display_name WHERE user_id = :user_id",
        {"user_id": user_id, "display_name": display_name},
    )
