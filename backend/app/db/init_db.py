"""Creates the Unity Catalog catalog/schema and all Delta tables for the app.

Run once (and safely re-run any time — everything is idempotent):
    python -m app.db.init_db
"""

from app.config import settings
from app.db.client import execute, get_connection

DDL_STATEMENTS = [
    f"CREATE CATALOG IF NOT EXISTS {settings.databricks_catalog}",
    f"CREATE SCHEMA IF NOT EXISTS {settings.full_schema}",
    f"""
    CREATE TABLE IF NOT EXISTS {settings.full_schema}.users (
        user_id STRING NOT NULL,
        email STRING NOT NULL,
        password_hash STRING NOT NULL,
        role STRING NOT NULL COMMENT 'student | pi',
        display_name STRING,
        created_at TIMESTAMP NOT NULL
    ) USING DELTA
    """,
    f"""
    CREATE TABLE IF NOT EXISTS {settings.full_schema}.student_profiles (
        student_id STRING NOT NULL,
        academic_year STRING,
        major STRING,
        availability_hrs INT,
        interests_text STRING COMMENT 'free-form interest description from Genie intake',
        interest_tags STRING COMMENT 'comma-separated normalized tags, used for keyword-overlap fallback',
        portfolio_url STRING COMMENT 'GitHub/LinkedIn/portfolio link, shown on the profile page',
        experience_text STRING COMMENT 'free-form prior experience blurb, set via profile edit, not intake chat',
        last_updated TIMESTAMP NOT NULL
    ) USING DELTA
    """,
    f"""
    CREATE TABLE IF NOT EXISTS {settings.full_schema}.student_skills (
        student_id STRING NOT NULL,
        skill_name STRING NOT NULL,
        proficiency STRING NOT NULL COMMENT 'beginner | intermediate | advanced'
    ) USING DELTA
    """,
    f"""
    CREATE TABLE IF NOT EXISTS {settings.full_schema}.labs (
        lab_id STRING NOT NULL,
        lab_name STRING NOT NULL,
        pi_name STRING NOT NULL,
        pi_user_id STRING,
        research_focus STRING NOT NULL,
        time_commitment_hrs INT NOT NULL,
        capacity INT NOT NULL,
        current_team_size INT NOT NULL,
        recent_publications STRING,
        application_questions STRING COMMENT 'pipe-separated extra questions a PI wants applicants to answer',
        team_composition STRING COMMENT 'e.g. "3 PhD, 2 undergrad" — shown on the lab profile page',
        website_url STRING,
        department STRING,
        application_process_text STRING COMMENT 'short blurb on what happens after a student applies',
        reliability_score DOUBLE NOT NULL
            COMMENT 'decayed by repeated no_response_flag reports, see applications; set 1.0 on insert',
        last_updated TIMESTAMP NOT NULL
    ) USING DELTA
    """,
    f"""
    CREATE TABLE IF NOT EXISTS {settings.full_schema}.lab_required_skills (
        lab_id STRING NOT NULL,
        skill_name STRING NOT NULL,
        depth STRING NOT NULL COMMENT 'beginner | intermediate | advanced'
    ) USING DELTA
    """,
    f"""
    CREATE TABLE IF NOT EXISTS {settings.full_schema}.applications (
        application_id STRING NOT NULL,
        student_id STRING NOT NULL,
        lab_id STRING NOT NULL,
        status STRING NOT NULL COMMENT 'Applied | Pending | Interview | Decision',
        drafted_message STRING,
        no_response_flag BOOLEAN NOT NULL COMMENT 'set FALSE on insert',
        created_at TIMESTAMP NOT NULL,
        updated_at TIMESTAMP NOT NULL
    ) USING DELTA
    """,
    f"""
    CREATE TABLE IF NOT EXISTS {settings.full_schema}.saved_labs (
        student_id STRING NOT NULL,
        lab_id STRING NOT NULL,
        saved_at TIMESTAMP NOT NULL
    ) USING DELTA
    """,
    f"""
    CREATE TABLE IF NOT EXISTS {settings.full_schema}.lab_views (
        lab_id STRING NOT NULL,
        student_id STRING NOT NULL,
        viewed_at TIMESTAMP NOT NULL
    ) USING DELTA
    """,
]


# Columns added after the tables already existed in a live workspace.
# CREATE TABLE IF NOT EXISTS above covers a fresh install; this covers
# migrating a database that was created before these columns existed.
NEW_COLUMNS = [
    ("users", "display_name", "STRING"),
    ("student_profiles", "portfolio_url", "STRING"),
    ("student_profiles", "experience_text", "STRING"),
    ("labs", "team_composition", "STRING"),
    ("labs", "website_url", "STRING"),
    ("labs", "department", "STRING"),
    ("labs", "application_process_text", "STRING"),
]


def _migrate_missing_columns():
    existing = execute(
        f"""
        SELECT table_name, column_name FROM {settings.databricks_catalog}.information_schema.columns
        WHERE table_schema = '{settings.databricks_schema}'
        """
    )
    have = {(row["table_name"], row["column_name"]) for row in existing}

    for table, column, coltype in NEW_COLUMNS:
        if (table, column) in have:
            continue
        print(f"Adding missing column {table}.{column}")
        execute(f"ALTER TABLE {settings.full_schema}.{table} ADD COLUMNS ({column} {coltype})")


def main():
    with get_connection() as conn:
        with conn.cursor() as cursor:
            for statement in DDL_STATEMENTS:
                print(f"Executing:\n{statement.strip()}\n")
                cursor.execute(statement)
    _migrate_missing_columns()
    print("Schema ready:", settings.full_schema)


if __name__ == "__main__":
    main()
