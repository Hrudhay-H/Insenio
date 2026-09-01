"""Wraps the Databricks Genie Space (Genie Agent) — natural-language Q&A over
the labs/lab_required_skills Delta tables. This is NOT a general chat agent:
Genie translates a question into SQL against the attached tables and returns
an answer, optionally with a result table. Used for the live "ask your own
question" demo moment and any lab-data lookups the app wants phrased in NL.
"""

from dataclasses import dataclass

from app.config import settings
from app.workspace_client import get_workspace_client


@dataclass
class GenieAnswer:
    conversation_id: str
    message_id: str
    text: str
    query: str | None
    result_rows: list[dict] | None


def _extract_text(message) -> str:
    parts = []
    for attachment in message.attachments or []:
        if attachment.text and attachment.text.content:
            parts.append(attachment.text.content)
    return "\n".join(parts).strip()


def _extract_query(message) -> str | None:
    for attachment in message.attachments or []:
        if attachment.query and attachment.query.query:
            return attachment.query.query
    return None


def ask_new_conversation(question: str) -> GenieAnswer:
    w = get_workspace_client()
    message = w.genie.start_conversation_and_wait(
        space_id=settings.genie_lab_space_id,
        content=question,
    )
    return _to_answer(message)


def ask_in_conversation(conversation_id: str, question: str) -> GenieAnswer:
    w = get_workspace_client()
    message = w.genie.create_message_and_wait(
        space_id=settings.genie_lab_space_id,
        conversation_id=conversation_id,
        content=question,
    )
    return _to_answer(message)


def _to_answer(message) -> GenieAnswer:
    w = get_workspace_client()
    query = _extract_query(message)
    result_rows = None
    if query:
        result = w.genie.get_message_query_result(
            space_id=settings.genie_lab_space_id,
            conversation_id=message.conversation_id,
            message_id=message.id,
        )
        statement = result.statement_response
        if statement and statement.manifest and statement.manifest.schema:
            columns = [c.name for c in statement.manifest.schema.columns]
            data_rows = []
            total_chunks = statement.manifest.total_chunk_count or 0
            for chunk_index in range(total_chunks):
                chunk = w.statement_execution.get_statement_result_chunk_n(
                    statement_id=statement.statement_id, chunk_index=chunk_index
                )
                data_rows.extend(chunk.data_array or [])
            result_rows = [dict(zip(columns, row)) for row in data_rows]

    return GenieAnswer(
        conversation_id=message.conversation_id,
        message_id=message.id,
        text=_extract_text(message),
        query=query,
        result_rows=result_rows,
    )
