import threading
from contextlib import contextmanager

from databricks import sql

from app.config import settings

_local = threading.local()


def _connect():
    return sql.connect(
        server_hostname=settings.server_hostname,
        http_path=settings.databricks_http_path,
        access_token=settings.databricks_token,
    )


@contextmanager
def get_connection():
    """Reuses one persistent connection per worker thread rather than opening
    a fresh one on every call — each new connection costs 1-3s+ of handshake
    overhead against the Databricks SQL warehouse, which compounds badly once
    a request needs several sequential queries (e.g. profile + skills)."""
    conn = getattr(_local, "connection", None)
    if conn is None:
        conn = _connect()
        _local.connection = conn
    try:
        yield conn
    except Exception:
        try:
            conn.close()
        except Exception:
            pass
        _local.connection = None
        raise


def execute(query: str, params: dict | tuple | None = None) -> list[dict]:
    """Runs one statement. Use native paramstyle: `:name` with a dict, or `?` with a tuple."""
    with get_connection() as conn:
        with conn.cursor() as cursor:
            cursor.execute(query, params)
            if cursor.description is None:
                return []
            columns = [col[0] for col in cursor.description]
            return [dict(zip(columns, row)) for row in cursor.fetchall()]


def execute_many(query: str, seq_of_params: list[dict]) -> None:
    """Runs the same parameterized statement once per dict in seq_of_params, one connection."""
    with get_connection() as conn:
        with conn.cursor() as cursor:
            for params in seq_of_params:
                cursor.execute(query, params)
