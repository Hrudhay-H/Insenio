from typing import Literal

from pydantic import BaseModel

Proficiency = Literal["beginner", "intermediate", "advanced"]


class SkillItem(BaseModel):
    skill_name: str
    proficiency: Proficiency


class StudentProfileOut(BaseModel):
    student_id: str
    academic_year: str | None
    major: str | None
    availability_hrs: int | None
    interests_text: str | None
    interest_tags: list[str]
    skills: list[SkillItem]
    last_updated: str | None


class StudentProfileUpdate(BaseModel):
    academic_year: str | None = None
    major: str | None = None
    availability_hrs: int | None = None
    interests_text: str | None = None
    interest_tags: list[str] | None = None
    skills: list[SkillItem] | None = None
