from fastapi import FastAPI
from starlette.middleware.sessions import SessionMiddleware

from src.core.config import settings
from src.auth.router import router as auth_router
from src.db.session import Base, engine

import src.models.user
import src.models.oauth_account

app = FastAPI(debug=settings.debug)

app.add_middleware(
    SessionMiddleware,
    secret_key=settings.session_secret_key,
    max_age=settings.session_expire_minutes * 60,
    same_site="lax",
    https_only=settings.app_env == "production",
)

Base.metadata.create_all(bind=engine)

app.include_router(auth_router)

