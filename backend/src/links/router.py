from __future__ import annotations

from datetime import datetime, timezone
from fastapi import APIRouter, Depends, Request, HTTPException, Query
from sqlalchemy.orm import Session

from src.auth.dependencies import get_current_user
from src.db.session import get_db
from src.models.user import User

from src.links.schemas import (
    LinkCreateRequest, LinkResponse, LinkListItem, LinkStatsResponse, ClickEventItem,
    DashboardResponse, KPIData, CountryData, LinkTableData, SparklinePoint
)
from src.links.service import (
    create_link, list_links_for_user, get_link_for_user, count_clicks_last_24h, recent_click_events,
    get_total_clicks_for_user, get_total_links_for_user, get_unique_visitors_for_user,
    get_unique_visitors_per_link, get_unique_visitors_for_link, get_clicks_by_country, get_clicks_time_series,
    get_previous_period_metrics, update_link_status
)
from src.links.country_names import get_country_name

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
    unique_visitors = get_unique_visitors_for_link(db, link_id=link.id)
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
        unique_visitors=unique_visitors,
        recent_clicks=[
            ClickEventItem(
                id=e.id,
                clicked_at=e.clicked_at,
                referrer_host=getattr(e, "referrer_host", None),
                country=getattr(e, "country", None),
                device_category=getattr(e, "device_category", None),
                browser_name=getattr(e, "browser_name", None),
                browser_version=getattr(e, "browser_version", None),
                os_name=getattr(e, "os_name", None),
                os_version=getattr(e, "os_version", None),
                engine=getattr(e, "engine", None),
            )
            for e in recent
        ],
    )


@router.get("/dashboard", response_model=DashboardResponse)
def get_dashboard_data(
    request: Request,
    start_date: str = Query(..., description="ISO datetime string for start of date range"),
    end_date: str = Query(..., description="ISO datetime string for end of date range"),
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """
    Get dashboard analytics data for the authenticated user.
    Includes KPIs, sparkline data, country breakdown, and links table.
    """
    try:
        start_dt = datetime.fromisoformat(start_date.replace("Z", "+00:00"))
        end_dt = datetime.fromisoformat(end_date.replace("Z", "+00:00"))
    except (ValueError, AttributeError) as e:
        raise HTTPException(status_code=400, detail=f"Invalid date format: {e}")
    
    # Ensure timezone-aware
    if start_dt.tzinfo is None:
        start_dt = start_dt.replace(tzinfo=timezone.utc)
    if end_dt.tzinfo is None:
        end_dt = end_dt.replace(tzinfo=timezone.utc)
    
    base = str(request.base_url).rstrip("/")
    
    # Get current period metrics
    total_clicks = get_total_clicks_for_user(db, user_id=user.id, start_date=start_dt, end_date=end_dt)
    total_links = get_total_links_for_user(db, user_id=user.id)
    unique_visitors = get_unique_visitors_for_user(db, user_id=user.id, start_date=start_dt, end_date=end_dt)
    
    # Get previous period for comparison
    prev_metrics = get_previous_period_metrics(db, user_id=user.id, current_start=start_dt, current_end=end_dt)
    
    # Determine granularity for sparkline based on date range
    duration = end_dt - start_dt
    if duration.days <= 1:
        granularity = "hour"
    elif duration.days <= 30:
        granularity = "day"
    else:
        granularity = "month"
    
    # Get sparkline data
    sparkline_data = get_clicks_time_series(
        db, user_id=user.id, start_date=start_dt, end_date=end_dt, granularity=granularity
    )
    
    # Get country data
    country_data_raw = get_clicks_by_country(db, user_id=user.id, start_date=start_dt, end_date=end_dt)
    total_country_clicks = sum(c["clicks"] for c in country_data_raw) if country_data_raw else 1
    
    countries = [
        CountryData(
            country_code=item["country_code"],
            country_name=get_country_name(item["country_code"]),
            clicks=item["clicks"],
            unique_visitors=item["unique_visitors"],
            percentage=(item["clicks"] / total_country_clicks * 100) if total_country_clicks > 0 else 0.0,
        )
        for item in country_data_raw
    ]
    
    # Get links with unique visitors
    links = list_links_for_user(db, user_id=user.id, limit=100, offset=0)
    link_ids = [link.id for link in links]
    unique_visitors_map = get_unique_visitors_per_link(
        db, link_ids=link_ids, start_date=start_dt, end_date=end_dt
    )
    
    links_table_data = [
        LinkTableData(
            id=link.id,
            short_url=f"{base}/{link.slug}",
            long_url=link.target_url,
            status="active" if link.is_active else "inactive",
            clicks=link.click_count,
            unique_visitors=unique_visitors_map.get(link.id, 0),
            last_clicked=link.last_clicked_at,
            created=link.created_at,
        )
        for link in links
    ]
    
    # Calculate deltas (percentage changes)
    def calc_delta(current: int, previous: int) -> float:
        if previous == 0:
            return 100.0 if current > 0 else 0.0
        return ((current - previous) / previous) * 100.0
    
    return DashboardResponse(
        kpis=KPIData(
            total_clicks=total_clicks,
            total_links=total_links,
            unique_visitors=unique_visitors,
            previous_period_clicks=prev_metrics["total_clicks"],
            previous_period_links=prev_metrics["total_links"],
            previous_period_unique_visitors=prev_metrics["unique_visitors"],
        ),
        sparkline_data=[SparklinePoint(**point) for point in sparkline_data],
        countries=countries,
        links=links_table_data,
    )


@router.patch("/{link_id}/status", response_model=LinkListItem)
def update_link_status_endpoint(
    request: Request,
    link_id: int,
    is_active: bool = Query(..., description="New active status for the link"),
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """Update the active/inactive status of a link."""
    link = update_link_status(db, user_id=user.id, link_id=link_id, is_active=is_active)
    if not link:
        raise HTTPException(status_code=404, detail="Link not found")
    
    base = str(request.base_url).rstrip("/")
    return LinkListItem(
        id=link.id,
        slug=link.slug,
        target_url=link.target_url,
        is_active=link.is_active,
        created_at=link.created_at,
        click_count=link.click_count,
        last_clicked_at=link.last_clicked_at,
        short_url=f"{base}/{link.slug}",
    )

