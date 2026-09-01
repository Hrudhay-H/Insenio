from typing import Literal

from pydantic import BaseModel

from app.models.match import SkillGapOut

ApplicationStatus = Literal["Applied", "Pending", "Interview", "Decision"]


class ApplicantOut(BaseModel):
    application_id: str
    student_id: str
    status: str
    drafted_message: str
    no_response_flag: bool
    created_at: str
    updated_at: str

    matched_skills: list[str]
    missing_skills: list[SkillGapOut]
    skill_overlap_ratio: float


class StatusUpdate(BaseModel):
    status: ApplicationStatus


class LabStatsOut(BaseModel):
    lab_id: str
    total_views: int
    unique_viewers: int
    strong_matches: int
    reliability_score: float
