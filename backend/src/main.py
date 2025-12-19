from fastapi import FastAPI
from starlette.middleware.sessions import SessionMiddleware
from src.core.config import settings
from src.auth.router import router as auth_router



app = FastAPI()



app.add_middleware(SessionMiddleware, secret_key=settings.session_secret_key)

app.include_router(auth_router)
