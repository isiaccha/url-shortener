from __future__ import annotations

from fastapi import APIRouter, Depends, Request, HTTPException, Query
from sqlalchemy.orm import Session

from src.auth.dependencies import get_current_user
from src.db.session import get_db
from src.models.user import User

from src.links.schemas import LinkCreateRequest, LinkResponse, LinkListItem, LinkStatsResponse, ClickEventItem
from src.links.service import create_link, list_links_for_user, get_link_for_user, count_clicks_last_24h, recent_click_events

router = APIRouter(prefix="/links", tags=["links"])


@router.post("", response_model=LinkResponse, status_code=201)
def create_link_endpoint(
    payload: LinkCreateRequest,
    request: Request,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
) -> LinkResponse:
    link = create_link(db, user_id=user.id, target_url=str(payload.target_url))

    base = str(request.base_url).rstrip("/")
    short_url = f"{base}/{link.slug}"

    return LinkResponse(
        id=link.id,
        slug=link.slug,
        target_url=link.target_url,
        is_active=link.is_active,
        created_at=link.created_at,
        click_count=link.click_count,
        short_url=short_url,
    )



@router.get("", response_model=list[LinkListItem])
def list_my_links(
    request: Request,
    limit: int = Query(10, ge=1, le=100),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    links = list_links_for_user(db, user_id=user.id, limit=limit, offset=offset)
    base = str(request.base_url).rstrip("/")

    return [
        LinkListItem(
            id=l.id,
            slug=l.slug,
            target_url=l.target_url,
            is_active=l.is_active,
            created_at=l.created_at,
            click_count=l.click_count,
            last_clicked_at=l.last_clicked_at,
            short_url=f"{base}/{l.slug}",
        )
        for l in links
    ]


@router.get("/{link_id}/stats", response_model=LinkStatsResponse)
def link_stats(
    link_id: int,
    request: Request,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    link = get_link_for_user(db, user_id=user.id, link_id=link_id)
    if not link:
        raise HTTPException(status_code=404, detail="Link not found")

    base = str(request.base_url).rstrip("/")
    clicks_24h = count_clicks_last_24h(db, link_id=link.id)
    recent = recent_click_events(db, link_id=link.id, limit=50)

    return LinkStatsResponse(
        link=LinkListItem(
            id=link.id,
            slug=link.slug,
            target_url=link.target_url,
            is_active=link.is_active,
            created_at=link.created_at,
            click_count=link.click_count,
            last_clicked_at=link.last_clicked_at,
            short_url=f"{base}/{link.slug}",
        ),
        clicks_last_24h=clicks_24h,
        recent_clicks=[
            ClickEventItem(
                id=e.id,
                clicked_at=e.clicked_at,
                referrer_host=getattr(e, "referrer_host", None),
                country=getattr(e, "country", None),
            )
            for e in recent
        ],
    )

