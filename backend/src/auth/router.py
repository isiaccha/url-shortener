from fastapi import APIRouter, Request
from starlette.responses import RedirectResponse
from src.core.oauth import oauth
from src.core.config import settings

router = APIRouter(prefix="/auth", tags=["auth"])

@router.get("/google/login")
async def google_login(request: Request):
    # sends user to Google
    return await oauth.google.authorize_redirect(
        request,
        redirect_uri=settings.google_redirect_uri,
    )

@router.get("/google/callback")
async def google_callback(request: Request):
    # exchanges code -> tokens
    token = await oauth.google.authorize_access_token(request)

    # gets user info from the ID token (openid)
    user = token.get("userinfo")
    if user is None:
        user = await oauth.google.userinfo(token=token)

    # TODO: create/find user in DB, then create YOUR session cookie
    return {"email": user["email"], "name": user.get("name")}

