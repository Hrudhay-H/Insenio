from pydantic import BaseModel


class QuestionAnswer(BaseModel):
    question: str
    answer: str


class ApplyAssistDraft(BaseModel):
    message: str
    answers: list[QuestionAnswer]


class ApplicationSubmit(BaseModel):
    lab_id: str
    message: str
    answers: list[QuestionAnswer] = []


class ApplicationOut(BaseModel):
    application_id: str
    lab_id: str
    lab_name: str
    status: str
    drafted_message: str
    no_response_flag: bool
    created_at: str
    updated_at: str
