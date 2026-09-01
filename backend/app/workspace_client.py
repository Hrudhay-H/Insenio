"""Shared Databricks SDK WorkspaceClient — backs Genie, Foundation Model serving,
and (later) Vector Search calls. One client, reused everywhere."""

from functools import lru_cache

from databricks.sdk import WorkspaceClient

from app.config import settings


@lru_cache(maxsize=1)
def get_workspace_client() -> WorkspaceClient:
    return WorkspaceClient(host=settings.databricks_host, token=settings.databricks_token)
