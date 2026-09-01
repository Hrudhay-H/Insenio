"""Transparent matching engine — TRD §2.4. Computes three components per lab
(skill overlap, interest alignment, availability overlap) and surfaces a
Ready now / Stretch pick label with named reasons, never a bare score.
"""

import re
from dataclasses import dataclass, field

from app.config import settings
from app.db.client import execute
from app.matching.semantic import query_similar_labs

FS = settings.full_schema
_STOPWORD_STRIP = re.compile(r"[^a-z0-9\s]")

_PROFICIENCY_RANK = {"beginner": 1, "intermediate": 2, "advanced": 3}

SKILL_MATCH_THRESHOLD = 0.7
SEMANTIC_ALIGNMENT_THRESHOLD = 0.45  # heuristic, same caveat as SKILL_MATCH_THRESHOLD — TRD §1.9


@dataclass
class SkillGap:
    skill_name: str
    required_depth: str


@dataclass
class LabMatch:
    lab_id: str
    lab_name: str
    pi_name: str
    research_focus: str
    time_commitment_hrs: int
    capacity: int
    current_team_size: int
    reliability_score: float
    last_updated: str

    matched_skills: list[str] = field(default_factory=list)
    missing_skills: list[SkillGap] = field(default_factory=list)
    skill_overlap_ratio: float = 0.0

    availability_fits: bool = False
    capacity_open: bool = False

    interest_alignment_score: float = 0.0
    matched_interests: list[str] = field(default_factory=list)
    interest_alignment_method: str = "keyword"  # "semantic" | "keyword"

    label: str | None = None
    reasons: list[str] = field(default_factory=list)


def _fetch_labs(lab_id: str | None = None) -> list[dict]:
    if lab_id:
        return execute(f"SELECT * FROM {FS}.labs WHERE lab_id = :lab_id", {"lab_id": lab_id})
    return execute(f"SELECT * FROM {FS}.labs")


def _fetch_required_skills_by_lab(lab_ids: list[str]) -> dict[str, list[dict]]:
    if not lab_ids:
        return {}
    placeholders = ", ".join(f":id{i}" for i in range(len(lab_ids)))
    params = {f"id{i}": lab_id for i, lab_id in enumerate(lab_ids)}
    rows = execute(
        f"SELECT lab_id, skill_name, depth FROM {FS}.lab_required_skills WHERE lab_id IN ({placeholders})",
        params,
    )
    by_lab: dict[str, list[dict]] = {}
    for row in rows:
        by_lab.setdefault(row["lab_id"], []).append(row)
    return by_lab


def _score_lab(lab: dict, required_skills: list[dict], student_skills: dict[str, str], interest_tags: list[str],
                availability_hrs: int | None, semantic_score: float | None) -> LabMatch:
    match = LabMatch(
        lab_id=lab["lab_id"],
        lab_name=lab["lab_name"],
        pi_name=lab["pi_name"],
        research_focus=lab["research_focus"],
        time_commitment_hrs=lab["time_commitment_hrs"],
        capacity=lab["capacity"],
        current_team_size=lab["current_team_size"],
        reliability_score=lab["reliability_score"],
        last_updated=str(lab["last_updated"]),
    )

    # 1. Skill overlap (depth-aware)
    for req in required_skills:
        student_prof = student_skills.get(req["skill_name"].lower())
        required_rank = _PROFICIENCY_RANK.get(req["depth"], 1)
        if student_prof and _PROFICIENCY_RANK.get(student_prof, 0) >= required_rank:
            match.matched_skills.append(req["skill_name"])
        else:
            match.missing_skills.append(SkillGap(skill_name=req["skill_name"], required_depth=req["depth"]))
    total_required = len(required_skills)
    match.skill_overlap_ratio = (len(match.matched_skills) / total_required) if total_required else 0.0

    # 2. Availability overlap
    match.availability_fits = bool(availability_hrs is not None and availability_hrs >= lab["time_commitment_hrs"])

    # 3. Interest alignment. Word-level keyword overlap always runs — it gives
    # concrete, quotable words for the reasons list (transparency). When the
    # Vector Search index (M5) is ready, its embedding similarity — a much
    # better signal for phrasing like "model building" vs. "foundation models"
    # that share no literal words — drives the actual score and label instead.
    focus_words = set(_STOPWORD_STRIP.sub(" ", lab["research_focus"].lower()).split())
    match.matched_interests = [
        tag for tag in interest_tags
        if tag and any(word in focus_words for word in tag.lower().split())
    ]
    keyword_score = (len(match.matched_interests) / len(interest_tags)) if interest_tags else 0.0

    if semantic_score is not None:
        match.interest_alignment_score = max(0.0, min(1.0, semantic_score))
        match.interest_alignment_method = "semantic"
    else:
        match.interest_alignment_score = keyword_score
        match.interest_alignment_method = "keyword"

    match.capacity_open = lab["current_team_size"] < lab["capacity"]

    # Output label — TRD §2.4: never a bare score, always paired with reasons.
    # "Stretch pick" specifically means real interest alignment plus a named
    # gap — skill overlap alone (without interest signal) stays unlabeled
    # rather than diluting the label into "any partial match."
    meaningful_interest = (
        match.interest_alignment_score >= SEMANTIC_ALIGNMENT_THRESHOLD
        if match.interest_alignment_method == "semantic"
        else match.interest_alignment_score > 0
    )
    if match.skill_overlap_ratio >= SKILL_MATCH_THRESHOLD and match.availability_fits and match.capacity_open:
        match.label = "Ready now"
    elif match.capacity_open and meaningful_interest and match.missing_skills:
        match.label = "Stretch pick"
    else:
        match.label = None

    match.reasons = _build_reasons(match, total_required)
    return match


def _build_reasons(match: LabMatch, total_required: int) -> list[str]:
    reasons = []
    if total_required:
        reasons.append(f"Matches {len(match.matched_skills)}/{total_required} required skills")
    if match.missing_skills:
        gaps = ", ".join(f"{g.skill_name} ({g.required_depth})" for g in match.missing_skills)
        reasons.append(f"Missing: {gaps}")
    if match.matched_interests:
        reasons.append(f"Interest overlap: {', '.join(match.matched_interests)}")
    elif match.interest_alignment_method == "semantic" and match.interest_alignment_score >= 0.45:
        strength = "Strong" if match.interest_alignment_score >= 0.7 else "Some"
        reasons.append(f"{strength} interest alignment with this lab's research focus (semantic match)")
    reasons.append(
        "Availability fits" if match.availability_fits else f"Needs {match.time_commitment_hrs} hrs/week"
    )
    reasons.append("Open slots" if match.capacity_open else "No open slots right now")
    return reasons


def match_student_to_labs(student_id: str, student_skills_rows: list[dict], availability_hrs: int | None,
                           interest_tags: list[str], interests_text: str | None = None,
                           lab_id: str | None = None, use_semantic: bool = True) -> list[LabMatch]:
    labs = _fetch_labs(lab_id)
    if not labs:
        return []

    required_by_lab = _fetch_required_skills_by_lab([lab["lab_id"] for lab in labs])
    student_skills = {row["skill_name"].lower(): row["proficiency"] for row in student_skills_rows}

    query_text = interests_text or ", ".join(interest_tags)
    semantic_scores = (
        query_similar_labs(query_text, num_results=len(labs)) if use_semantic and query_text.strip() else {}
    )

    matches = [
        _score_lab(
            lab,
            required_by_lab.get(lab["lab_id"], []),
            student_skills,
            interest_tags,
            availability_hrs,
            semantic_scores.get(lab["lab_id"]),
        )
        for lab in labs
    ]

    label_priority = {"Ready now": 0, "Stretch pick": 1, None: 2}
    matches.sort(
        key=lambda m: (label_priority[m.label], -(m.skill_overlap_ratio + m.interest_alignment_score))
    )
    return matches


def count_strong_matches_for_lab(lab_id: str) -> int:
    """How many students currently have a Ready now / Stretch pick label
    against this lab — the "N strong matches" figure in the PI mini-dashboard.

    Bulk-fetches every student's profile and skills in two queries total
    (not two-per-student) and scores in Python — the naive per-student loop
    made O(students) round trips to the warehouse and timed out past ~15
    students. Keyword-only interest alignment (no Vector Search calls here
    either) — an approximation is fine for an incentive-dashboard count.
    """
    labs = _fetch_labs(lab_id)
    if not labs:
        return 0
    lab = labs[0]
    required_skills = _fetch_required_skills_by_lab([lab_id]).get(lab_id, [])

    profiles = execute(f"SELECT * FROM {FS}.student_profiles")
    if not profiles:
        return 0

    student_ids = [p["student_id"] for p in profiles]
    placeholders = ", ".join(f":id{i}" for i in range(len(student_ids)))
    params = {f"id{i}": sid for i, sid in enumerate(student_ids)}
    all_skill_rows = execute(
        f"SELECT student_id, skill_name, proficiency FROM {FS}.student_skills WHERE student_id IN ({placeholders})",
        params,
    )
    skills_by_student: dict[str, list[dict]] = {}
    for row in all_skill_rows:
        skills_by_student.setdefault(row["student_id"], []).append(row)

    count = 0
    for profile in profiles:
        tags = [t.strip() for t in (profile.get("interest_tags") or "").split(",") if t.strip()]
        student_skills = {
            r["skill_name"].lower(): r["proficiency"] for r in skills_by_student.get(profile["student_id"], [])
        }
        m = _score_lab(lab, required_skills, student_skills, tags, profile.get("availability_hrs"), None)
        if m.label in ("Ready now", "Stretch pick"):
            count += 1
    return count
