from fastapi import APIRouter, Request, Depends
from sqlalchemy.orm import Session
from starlette.responses import RedirectResponse

from src.core.oauth import oauth
from src.core.config import settings
from src.db.session import get_db
from src.models.user import User
from src.models.oauth_account import OAuthAccount
from src.auth.dependencies import get_current_user

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

    # 4) Redirect back to frontend
    return RedirectResponse(url=f"{settings.frontend_url}/auth/callback?success=true")


@router.get("/me")
def me(current_user: User = Depends(get_current_user)):
    return {
        "user": {
            "id": current_user.id,
            "email": current_user.email,
            "display_name": current_user.display_name,
            "avatar_url": current_user.avatar_url,
        }
    }


@router.post("/logout")
def logout(request: Request):
    request.session.pop("user_id", None)
    return {"ok": True}

