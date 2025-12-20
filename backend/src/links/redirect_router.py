from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from starlette.responses import RedirectResponse

from src.db.session import get_db
from src.links.service import get_active_link_by_slug, record_click

router = APIRouter(tags=["redirect"])


@router.get("/{slug}")
def redirect(slug: str, request: Request, db: Session = Depends(get_db)):
    link = get_active_link_by_slug(db, slug=slug)
    if not link:
        raise HTTPException(status_code=404, detail="Link not found")

    try:
        record_click(db, link=link, request=request)
    except Exception:
        db.rollback()  # never block redirect due to analytics

    return RedirectResponse(url=link.target_url, status_code=302)

