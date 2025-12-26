from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.sessions import SessionMiddleware

from src.core.config import settings
from src.auth.router import router as auth_router
from src.links.router import router as links_router
from src.links.redirect_router import router as redirect_router
from src.db.session import Base, engine

# Import all models to ensure they're registered with SQLAlchemy Base
import src.models.user
import src.models.oauth_account
import src.models.link
import src.models.click_event

app = FastAPI(debug=settings.debug)

# CORS middleware - must be added before SessionMiddleware
# Build CORS origins list: use frontend_url from settings, plus localhost for local dev
cors_origins = [settings.frontend_url]
if settings.app_env == "local":
    # Add common localhost ports for development
    cors_origins.extend([
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:5175",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174",
        "http://127.0.0.1:5175",
    ])

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,  # Required for session cookies
    allow_methods=["*"],  # Allow all methods (GET, POST, etc.)
    allow_headers=["*"],  # Allow all headers
)

app.add_middleware(
    SessionMiddleware,
    secret_key=settings.session_secret_key,
    max_age=settings.session_expire_minutes * 60,
    same_site="none" if settings.app_env == "production" else "lax",  # "none" required for cross-site cookies in production
    https_only=settings.app_env == "production",  # Required when same_site="none"
)


app.include_router(auth_router)
app.include_router(links_router, prefix="/api")
app.include_router(redirect_router)
