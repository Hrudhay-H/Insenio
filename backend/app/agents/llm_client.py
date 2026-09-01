"""Thin wrapper over a Databricks Foundation Model API chat endpoint.

This is the general-purpose conversational layer used by the intake agent
(structured profile extraction) and Apply Assist (grounded message drafting)
— distinct from the Genie Space, which only answers NL questions over SQL
tables and can't hold a free-form conversation or take a write action.
"""

import json
import re

from databricks.sdk.service.serving import ChatMessage, ChatMessageRole

from app.config import settings
from app.workspace_client import get_workspace_client

_ROLE_MAP = {
    "system": ChatMessageRole.SYSTEM,
    "user": ChatMessageRole.USER,
    "assistant": ChatMessageRole.ASSISTANT,
}


def chat(messages: list[dict], temperature: float = 0.2, max_tokens: int = 800) -> str:
    """messages: [{"role": "system"|"user"|"assistant", "content": "..."}]"""
    w = get_workspace_client()
    sdk_messages = [ChatMessage(role=_ROLE_MAP[m["role"]], content=m["content"]) for m in messages]
    response = w.serving_endpoints.query(
        name=settings.foundation_model_endpoint,
        messages=sdk_messages,
        temperature=temperature,
        max_tokens=max_tokens,
    )
    return response.choices[0].message.content


def chat_json(messages: list[dict], temperature: float = 0.1, max_tokens: int = 800) -> dict:
    """Same as chat(), but asks for and parses a JSON object reply.

    Models on Foundation Model APIs don't uniformly support a strict JSON
    response_format, so we prompt for JSON explicitly and extract the first
    {...} block defensively rather than trust exact-match parsing.
    """
    raw = chat(messages, temperature=temperature, max_tokens=max_tokens)
    match = re.search(r"\{.*\}", raw, re.DOTALL)
    if not match:
        raise ValueError(f"Model did not return JSON: {raw!r}")
    return json.loads(match.group(0))
