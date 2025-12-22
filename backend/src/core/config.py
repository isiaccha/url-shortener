from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    # App
    app_env: str = "local"
    debug: bool = False

    # Database
    database_url: str

    # OAuth
    google_client_id: str
    google_client_secret: str
    google_redirect_uri: str
    
    # Frontend
    frontend_url: str = "http://localhost:5175"

    # Auth / Sessions
    session_secret_key: str
    session_expire_minutes: int = 30

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
    )


settings = Settings()

