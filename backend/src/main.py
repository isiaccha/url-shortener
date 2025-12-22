from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.sessions import SessionMiddleware

from src.core.config import settings
from src.auth.router import router as auth_router
from src.links.router import router as links_router
from src.links.redirect_router import router as redirect_router
from src.db.session import Base, engine

import src.models.user
import src.models.oauth_account

app = FastAPI(debug=settings.debug)

# CORS middleware - must be added before SessionMiddleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:5175",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174",
        "http://127.0.0.1:5175",
    ],
    allow_credentials=True,  # Required for session cookies
    allow_methods=["*"],  # Allow all methods (GET, POST, etc.)
    allow_headers=["*"],  # Allow all headers
)

app.add_middleware(
    SessionMiddleware,
    secret_key=settings.session_secret_key,
    max_age=settings.session_expire_minutes * 60,
    same_site="lax",  # "lax" allows cookies on top-level navigations (like OAuth redirects)
    https_only=settings.app_env == "production",
)


app.include_router(auth_router)
app.include_router(links_router, prefix="/api")
app.include_router(redirect_router)
