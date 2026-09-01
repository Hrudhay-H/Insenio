from typing import Literal

from pydantic import BaseModel

Depth = Literal["beginner", "intermediate", "advanced"]


class RequiredSkillItem(BaseModel):
    skill_name: str
    depth: Depth


class LabCreate(BaseModel):
    lab_name: str
    research_focus: str
    time_commitment_hrs: int
    capacity: int
    recent_publications: str | None = None
    application_questions: list[str] = []
    required_skills: list[RequiredSkillItem] = []


class LabUpdate(BaseModel):
    research_focus: str | None = None
    time_commitment_hrs: int | None = None
    capacity: int | None = None
    current_team_size: int | None = None
    recent_publications: str | None = None
    application_questions: list[str] | None = None
    required_skills: list[RequiredSkillItem] | None = None


class LabOut(BaseModel):
    lab_id: str
    lab_name: str
    pi_name: str
    pi_user_id: str | None
    research_focus: str
    time_commitment_hrs: int
    capacity: int
    current_team_size: int
    recent_publications: str | None
    application_questions: list[str]
    reliability_score: float
    last_updated: str
    required_skills: list[RequiredSkillItem]
    saved: bool = False
