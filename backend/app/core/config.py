from pydantic_settings import BaseSettings, SettingsConfigDict
class Settings(BaseSettings):

    APP_NAME: str
    DATABASE_URL: str
    SECRET_KEY: str
    ALGORITHM: str
    ACCESS_TOKEN_EXPIRE_MINUTES: int
    GEMINI_API_KEY : str
    GEMINI_MODEL:str
    GEMINI_FALLBACK_MODEL:str
    JWT_SECRET_KEY: str
    model_config = SettingsConfigDict(
        env_file=".env"
    )

settings = Settings()

# print(settings.APP_NAME)