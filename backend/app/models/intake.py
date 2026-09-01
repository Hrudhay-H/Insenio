from typing import Literal

from pydantic import BaseModel

from app.models.profile import StudentProfileOut


class ChatMessageIn(BaseModel):
    role: Literal["user", "assistant"]
    content: str


class IntakeChatRequest(BaseModel):
    messages: list[ChatMessageIn]


class IntakeChatResponse(BaseModel):
    reply: str
    profile: StudentProfileOut
