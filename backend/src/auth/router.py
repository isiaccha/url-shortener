from fastapi import APIRouter, Request, Depends
from sqlalchemy.orm import Session
from starlette.responses import RedirectResponse

from src.core.oauth import oauth
from src.core.config import settings
from src.db.session import get_db
from src.models.user import User
from src.models.oauth_account import OAuthAccount

router = APIRouter(prefix="/auth", tags=["auth"])


@router.get("/google/login")
async def google_login(request: Request):
    return await oauth.google.authorize_redirect(
        request,
        redirect_uri=settings.google_redirect_uri,
    )


@router.get("/google/callback")
async def google_callback(request: Request, db: Session = Depends(get_db)):
    token = await oauth.google.authorize_access_token(request)
    info = token.get("userinfo") or await oauth.google.userinfo(token=token)

    provider = "google"
    sub = info["sub"]
    email = info["email"]
    name = info.get("name")
    picture = info.get("picture")

    # 1) Find oauth identity first (stable)
    oauth_row = (
        db.query(OAuthAccount)
        .filter_by(provider=provider, provider_user_id=sub)
        .one_or_none()
    )

    if oauth_row:
        user = db.query(User).filter_by(id=oauth_row.user_id).one()
        # optional: keep user profile fresh
        user.email = email
        user.display_name = name
        user.avatar_url = picture
    else:
        # 2) If no oauth row, find/create user by email
        user = db.query(User).filter_by(email=email).one_or_none()
        if not user:
            user = User(email=email, display_name=name, avatar_url=picture)
            db.add(user)
            db.flush()  # assigns user.id without committing yet
        else:
            user.display_name = name
            user.avatar_url = picture

        oauth_row = OAuthAccount(
            user_id=user.id,
            provider=provider,
            provider_user_id=sub,
        )
        db.add(oauth_row)

    db.commit()

    # 3) Create YOUR app session
    request.session["user_id"] = user.id

    # 4) Redirect back to frontend (or return JSON for now)
    return {
        "message": "login successful",
        "user": {
            "id": user.id,
            "email": user.email,
            "display_name": user.display_name,
            "avatar_url": user.avatar_url,
        }
    }



@router.get("/me")
def me(request: Request, db: Session = Depends(get_db)):
    user_id = request.session.get("user_id")
    if not user_id:
        return {"user": None}

    user = db.query(User).filter_by(id=user_id).one_or_none()
    if not user:
        request.session.pop("user_id", None)
        return {"user": None}

    return {
        "user": {
            "id": user.id,
            "email": user.email,
            "display_name": user.display_name,
            "avatar_url": user.avatar_url,
        }
    }


@router.post("/logout")
def logout(request: Request):
    request.session.pop("user_id", None)
    return {"ok": True}

