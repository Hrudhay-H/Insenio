"""One-time setup for semantic interest-alignment (M5):
1. Enable Change Data Feed on `labs` (required for a Delta Sync index).
2. Create the Vector Search endpoint (Free Edition: 1 endpoint / 1 unit).
3. Create a Delta Sync index over labs.research_focus, embedded via the
   Foundation Model embeddings endpoint — Databricks computes and syncs
   embeddings automatically, no manual embedding pipeline needed.

Run once:
    python -m app.db.init_vector_search
Then copy the printed VECTOR_SEARCH_INDEX_NAME into .env.
"""

import time

from databricks.sdk.service.vectorsearch import (
    DeltaSyncVectorIndexSpecRequest,
    EmbeddingSourceColumn,
    EndpointType,
    PipelineType,
    VectorIndexType,
)

from app.config import settings
from app.db.client import execute
from app.workspace_client import get_workspace_client

FS = settings.full_schema
INDEX_NAME = f"{FS}.labs_research_focus_index"


def enable_change_data_feed():
    execute(f"ALTER TABLE {FS}.labs SET TBLPROPERTIES (delta.enableChangeDataFeed = true)")
    print(f"Change Data Feed enabled on {FS}.labs")


def ensure_endpoint():
    w = get_workspace_client()
    existing = {ep.name for ep in w.vector_search_endpoints.list_endpoints()}
    if settings.vector_search_endpoint_name in existing:
        print(f"Vector Search endpoint already exists: {settings.vector_search_endpoint_name}")
        return
    print(f"Creating Vector Search endpoint: {settings.vector_search_endpoint_name} (can take a few minutes)")
    w.vector_search_endpoints.create_endpoint_and_wait(
        name=settings.vector_search_endpoint_name,
        endpoint_type=EndpointType.STANDARD,
    )
    print("Endpoint online.")


def ensure_index():
    w = get_workspace_client()
    existing_names = {idx.name for idx in w.vector_search_indexes.list_indexes(settings.vector_search_endpoint_name)}
    if INDEX_NAME in existing_names:
        print(f"Index already exists: {INDEX_NAME} — waiting for it to become ready")
    else:
        print(f"Creating Delta Sync index: {INDEX_NAME}")
        w.vector_search_indexes.create_index(
            name=INDEX_NAME,
            endpoint_name=settings.vector_search_endpoint_name,
            primary_key="lab_id",
            index_type=VectorIndexType.DELTA_SYNC,
            delta_sync_index_spec=DeltaSyncVectorIndexSpecRequest(
                source_table=f"{FS}.labs",
                pipeline_type=PipelineType.TRIGGERED,
                columns_to_sync=["lab_id", "lab_name", "research_focus"],
                embedding_source_columns=[
                    EmbeddingSourceColumn(
                        name="research_focus",
                        embedding_model_endpoint_name=settings.embedding_model_endpoint,
                    )
                ],
            ),
        )
        print("Index created.")

    _wait_for_index_ready()
    w.vector_search_indexes.sync_index(INDEX_NAME)
    print("Sync triggered. It may take a minute to finish embedding all rows.")


def _wait_for_index_ready(timeout_s: int = 900):
    w = get_workspace_client()
    start = time.time()
    while time.time() - start < timeout_s:
        idx = w.vector_search_indexes.get_index(INDEX_NAME)
        message = idx.status.message if idx.status else None
        print(f"  index status: {message}")
        if idx.status and idx.status.ready:
            return
        time.sleep(10)
    raise TimeoutError("Vector Search index did not become ready in time")


def main():
    enable_change_data_feed()
    ensure_endpoint()
    ensure_index()
    print(f"\nSet in .env: VECTOR_SEARCH_INDEX_NAME={INDEX_NAME}")


if __name__ == "__main__":
    main()
