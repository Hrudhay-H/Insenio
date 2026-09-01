from typing import Literal

from pydantic import BaseModel

Proficiency = Literal["beginner", "intermediate", "advanced"]


class SkillItem(BaseModel):
    skill_name: str
    proficiency: Proficiency


class StudentProfileOut(BaseModel):
    student_id: str
    display_name: str | None = None
    academic_year: str | None
    major: str | None
    availability_hrs: int | None
    interests_text: str | None
    interest_tags: list[str]
    skills: list[SkillItem]
    portfolio_url: str | None = None
    experience_text: str | None = None
    last_updated: str | None


class StudentProfileUpdate(BaseModel):
    display_name: str | None = None
    academic_year: str | None = None
    major: str | None = None
    availability_hrs: int | None = None
    interests_text: str | None = None
    interest_tags: list[str] | None = None
    skills: list[SkillItem] | None = None
    portfolio_url: str | None = None
    experience_text: str | None = None
