from pydantic import BaseModel


class SkillGapOut(BaseModel):
    skill_name: str
    required_depth: str


class LabMatchOut(BaseModel):
    lab_id: str
    lab_name: str
    pi_name: str
    research_focus: str
    time_commitment_hrs: int
    capacity: int
    current_team_size: int
    reliability_score: float
    last_updated: str

    matched_skills: list[str]
    missing_skills: list[SkillGapOut]
    skill_overlap_ratio: float

    availability_fits: bool
    capacity_open: bool

    interest_alignment_score: float
    interest_alignment_method: str
    matched_interests: list[str]

    label: str | None
    reasons: list[str]
