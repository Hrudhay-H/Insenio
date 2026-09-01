"""Semantic interest-alignment via Databricks Vector Search (M5) — replaces
the word-overlap fallback in engine.py with real embedding similarity between
a student's stated interests and each lab's research_focus text.
"""

from app.config import settings
from app.workspace_client import get_workspace_client


def trigger_index_sync() -> None:
    """Best-effort refresh of the Vector Search index after labs.research_focus
    changes. Never raises — a stale index just means the interest-alignment
    fallback (keyword overlap) stays in play a bit longer, not a broken request."""
    if not settings.vector_search_index_name:
        return
    try:
        get_workspace_client().vector_search_indexes.sync_index(settings.vector_search_index_name)
    except Exception:
        pass


def query_similar_labs(query_text: str, num_results: int = 50) -> dict[str, float]:
    """Returns {lab_id: similarity_score}, higher is more similar.
    Returns {} (never raises) if the index isn't ready yet or isn't configured
    — callers should fall back to keyword overlap in that case."""
    if not settings.vector_search_index_name or not query_text.strip():
        return {}

    try:
        w = get_workspace_client()
        response = w.vector_search_indexes.query_index(
            index_name=settings.vector_search_index_name,
            columns=["lab_id"],
            query_text=query_text,
            num_results=num_results,
        )
        if not response.result or not response.manifest:
            return {}

        columns = [c.name for c in response.manifest.columns]
        lab_id_idx = columns.index("lab_id")
        score_idx = columns.index("score") if "score" in columns else len(columns) - 1

        scores: dict[str, float] = {}
        for row in response.result.data_array or []:
            lab_id = row[lab_id_idx]
            score = float(row[score_idx])
            scores[lab_id] = score
        return scores
    except Exception:
        return {}
