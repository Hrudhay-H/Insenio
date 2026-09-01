"""Freshness/decay signal — PRD §1.6/§1.9. Labs a student reports "applied,
no response" to repeatedly get a quietly lowered reliability_score, using
data already captured on the applications table. Heuristic, same caveat as
the matching thresholds (PRD §1.9: "weights are heuristic, not calibrated
against real outcomes yet").
"""

from app.config import settings
from app.db.applications import count_for_lab
from app.db.client import execute

FS = settings.full_schema

DECAY_PER_NO_RESPONSE = 0.15
MIN_RELIABILITY = 0.3


def recompute_reliability(lab_id: str) -> float:
    counts = count_for_lab(lab_id)
    score = max(MIN_RELIABILITY, 1.0 - DECAY_PER_NO_RESPONSE * counts["no_response_count"])
    execute(
        f"UPDATE {FS}.labs SET reliability_score = :score WHERE lab_id = :lab_id",
        {"lab_id": lab_id, "score": score},
    )
    return score
