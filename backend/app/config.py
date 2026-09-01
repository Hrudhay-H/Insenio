from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

    databricks_host: str
    databricks_token: str
    databricks_http_path: str
    databricks_catalog: str = "insenio"
    databricks_schema: str = "campus_lab_match"

    genie_lab_space_id: str = ""
    foundation_model_endpoint: str = "databricks-meta-llama-3-3-70b-instruct"
    embedding_model_endpoint: str = "databricks-gte-large-en"

    vector_search_endpoint_name: str = "insenio-vs-endpoint"
    vector_search_index_name: str = ""  # set after M5 setup — {catalog}.{schema}.labs_research_focus_index

    jwt_secret: str = "change-me-to-a-random-string"

    @property
    def server_hostname(self) -> str:
        return self.databricks_host.replace("https://", "").replace("http://", "").rstrip("/")

    @property
    def full_schema(self) -> str:
        return f"{self.databricks_catalog}.{self.databricks_schema}"


settings = Settings()
