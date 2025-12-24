from __future__ import annotations

from datetime import datetime, timezone, timedelta

from fastapi import Request
from sqlalchemy import select, func, desc, and_, distinct, text
from sqlalchemy.orm import Session
from src.core.config import settings

from src.links.slug import slug_for_id
from src.links.utils import (
    get_client_ip,
    get_referrer_host,
    get_ua_raw,
    make_visitor_hash,
    get_country_from_ip,
    parse_user_agent,
)
from src.models.link import Link
from src.models.click_event import ClickEvent


def create_link(db: Session, *, user_id: int, target_url: str) -> Link:
    link = Link(user_id=user_id, target_url=target_url, is_active=True)
    db.add(link)
    db.flush()  # assigns link.id

    link.slug = slug_for_id(link.id)

    db.commit()
    db.refresh(link)
    return link


def get_active_link_by_slug(db: Session, *, slug: str) -> Link | None:
    stmt = select(Link).where(Link.slug == slug, Link.is_active == True)  # noqa: E712
    return db.execute(stmt).scalar_one_or_none()


def record_click(db: Session, *, link: Link, request: Request) -> None:
    """
    Record a click event with full analytics data.
    Extracts IP, user agent, referrer from request, creates visitor hash,
    looks up country (using raw IP but not storing it), and records everything.
    """
    # Extract analytics data from request
    ip = get_client_ip(request)
    ua = get_ua_raw(request)
    referrer_host = get_referrer_host(request)
    visitor_hash = make_visitor_hash(ip, ua)
    
    # Look up country using raw IP (but don't store the IP itself)
    country = get_country_from_ip(ip)
    
    # Parse user agent for structured data
    parsed_ua = parse_user_agent(ua)
    
    # Create click event with all analytics fields
    evt = ClickEvent(
        link_id=link.id,
        referrer_host=referrer_host,
        ua_raw=ua,
        visitor_hash=visitor_hash,
        country=country,
        device_category=parsed_ua["device_category"],
        browser_name=parsed_ua["browser_name"],
        browser_version=parsed_ua["browser_version"],
        os_name=parsed_ua["os_name"],
        os_version=parsed_ua["os_version"],
        engine=parsed_ua["engine"],
    )
    db.add(evt)

    # Update link statistics
    link.click_count += 1
    link.last_clicked_at = datetime.now(timezone.utc)

    db.commit()


def list_links_for_user(db: Session, *, user_id: int, limit: int, offset: int) -> list[Link]:
    stmt = (
        select(Link)
        .where(Link.user_id == user_id)
        .order_by(desc(Link.created_at))
        .limit(limit)
        .offset(offset)
    )
    return list(db.execute(stmt).scalars().all())


def get_link_for_user(db: Session, *, user_id: int, link_id: int) -> Link | None:
    stmt = select(Link).where(Link.id == link_id, Link.user_id == user_id)
    return db.execute(stmt).scalar_one_or_none()


def count_clicks_last_24h(db: Session, *, link_id: int) -> int:
    since = datetime.now(timezone.utc) - timedelta(hours=24)
    stmt = select(func.count()).select_from(ClickEvent).where(
        ClickEvent.link_id == link_id,
        ClickEvent.clicked_at >= since,
    )
    return int(db.execute(stmt).scalar_one())


def recent_click_events(db: Session, *, link_id: int, limit: int = 50) -> list[ClickEvent]:
    stmt = (
        select(ClickEvent)
        .where(ClickEvent.link_id == link_id)
        .order_by(desc(ClickEvent.clicked_at))
        .limit(limit)
    )
    return list(db.execute(stmt).scalars().all())


# Dashboard analytics functions

def get_total_clicks_for_user(
    db: Session, *, user_id: int, start_date: datetime | None = None, end_date: datetime | None = None
) -> int:
    """Get total clicks across all user's links, optionally filtered by date range."""
    stmt = select(func.sum(Link.click_count)).where(Link.user_id == user_id)
    
    if start_date or end_date:
        # If date filtering, we need to count from ClickEvents instead
        link_ids_stmt = select(Link.id).where(Link.user_id == user_id)
        click_stmt = select(func.count(ClickEvent.id)).where(ClickEvent.link_id.in_(link_ids_stmt))
        
        if start_date:
            # Ensure UTC for consistent comparison
            if start_date.tzinfo is not None:
                start_date_utc = start_date.astimezone(timezone.utc)
            else:
                start_date_utc = start_date.replace(tzinfo=timezone.utc)
            click_stmt = click_stmt.where(ClickEvent.clicked_at >= start_date_utc)
        if end_date:
            # Ensure UTC for consistent comparison
            if end_date.tzinfo is not None:
                end_date_utc = end_date.astimezone(timezone.utc)
            else:
                end_date_utc = end_date.replace(tzinfo=timezone.utc)
            click_stmt = click_stmt.where(ClickEvent.clicked_at <= end_date_utc)
        
        result = db.execute(click_stmt).scalar_one()
        return int(result) if result else 0
    
    result = db.execute(stmt).scalar_one()
    return int(result) if result else 0


def get_total_links_for_user(db: Session, *, user_id: int) -> int:
    """Get total number of links for a user."""
    stmt = select(func.count(Link.id)).where(Link.user_id == user_id)
    return int(db.execute(stmt).scalar_one())


def get_unique_visitors_for_user(
    db: Session, *, user_id: int, start_date: datetime | None = None, end_date: datetime | None = None
) -> int:
    """Get count of unique visitors (distinct visitor_hash) across all user's links."""
    link_ids_stmt = select(Link.id).where(Link.user_id == user_id)
    
    stmt = (
        select(func.count(distinct(ClickEvent.visitor_hash)))
        .where(
            ClickEvent.link_id.in_(link_ids_stmt),
            ClickEvent.visitor_hash.isnot(None),
        )
    )
    
    if start_date:
        # Ensure UTC for consistent comparison
        if start_date.tzinfo is not None:
            start_date_utc = start_date.astimezone(timezone.utc)
        else:
            start_date_utc = start_date.replace(tzinfo=timezone.utc)
        stmt = stmt.where(ClickEvent.clicked_at >= start_date_utc)
    if end_date:
        # Ensure UTC for consistent comparison
        if end_date.tzinfo is not None:
            end_date_utc = end_date.astimezone(timezone.utc)
        else:
            end_date_utc = end_date.replace(tzinfo=timezone.utc)
        stmt = stmt.where(ClickEvent.clicked_at <= end_date_utc)
    
    result = db.execute(stmt).scalar_one()
    return int(result) if result else 0


def get_unique_visitors_per_link(
    db: Session, *, link_ids: list[int], start_date: datetime | None = None, end_date: datetime | None = None
) -> dict[int, int]:
    """Get unique visitor count per link. Returns dict mapping link_id to count."""
    stmt = (
        select(
            ClickEvent.link_id,
            func.count(distinct(ClickEvent.visitor_hash)).label("unique_count")
        )
        .where(
            ClickEvent.link_id.in_(link_ids),
            ClickEvent.visitor_hash.isnot(None),
        )
        .group_by(ClickEvent.link_id)
    )
    
    if start_date:
        stmt = stmt.where(ClickEvent.clicked_at >= start_date)
    if end_date:
        stmt = stmt.where(ClickEvent.clicked_at <= end_date)
    
    results = db.execute(stmt).all()
    return {row.link_id: int(row.unique_count) for row in results}


def get_unique_visitors_for_link(
    db: Session, *, link_id: int, start_date: datetime | None = None, end_date: datetime | None = None
) -> int:
    """Get unique visitor count for a single link."""
    stmt = (
        select(func.count(distinct(ClickEvent.visitor_hash)))
        .where(
            ClickEvent.link_id == link_id,
            ClickEvent.visitor_hash.isnot(None),
        )
    )
    
    if start_date:
        # Ensure UTC for consistent comparison
        if start_date.tzinfo is not None:
            start_date_utc = start_date.astimezone(timezone.utc)
        else:
            start_date_utc = start_date.replace(tzinfo=timezone.utc)
        stmt = stmt.where(ClickEvent.clicked_at >= start_date_utc)
    if end_date:
        # Ensure UTC for consistent comparison
        if end_date.tzinfo is not None:
            end_date_utc = end_date.astimezone(timezone.utc)
        else:
            end_date_utc = end_date.replace(tzinfo=timezone.utc)
        stmt = stmt.where(ClickEvent.clicked_at <= end_date_utc)
    
    result = db.execute(stmt).scalar()
    return int(result) if result else 0


def get_clicks_by_country(
    db: Session, *, user_id: int, start_date: datetime | None = None, end_date: datetime | None = None
) -> list[dict[str, int]]:
    """Get clicks aggregated by country code. Returns list of {country_code, clicks, unique_visitors}."""
    link_ids_stmt = select(Link.id).where(Link.user_id == user_id)
    
    stmt = (
        select(
            ClickEvent.country,
            func.count(ClickEvent.id).label("clicks"),
            func.count(distinct(ClickEvent.visitor_hash)).label("unique_visitors")
        )
        .where(
            ClickEvent.link_id.in_(link_ids_stmt),
            ClickEvent.country.isnot(None),
        )
        .group_by(ClickEvent.country)
        .order_by(desc("clicks"))
    )
    
    # Apply date filters - ensure timezone-aware datetimes work with SQLite
    if start_date:
        # Convert to UTC if timezone-aware, or ensure it's timezone-aware
        if start_date.tzinfo is not None:
            # Convert to UTC for consistent comparison
            start_date_utc = start_date.astimezone(timezone.utc)
        else:
            start_date_utc = start_date.replace(tzinfo=timezone.utc)
        stmt = stmt.where(ClickEvent.clicked_at >= start_date_utc)
    
    if end_date:
        # Convert to UTC if timezone-aware, or ensure it's timezone-aware
        if end_date.tzinfo is not None:
            # Convert to UTC for consistent comparison
            end_date_utc = end_date.astimezone(timezone.utc)
        else:
            end_date_utc = end_date.replace(tzinfo=timezone.utc)
        stmt = stmt.where(ClickEvent.clicked_at <= end_date_utc)
    
    results = db.execute(stmt).all()
    return [
        {
            "country_code": row.country,
            "clicks": int(row.clicks),
            "unique_visitors": int(row.unique_visitors) if row.unique_visitors else 0,
        }
        for row in results
    ]


def get_clicks_time_series(
    db: Session, *, user_id: int, start_date: datetime, end_date: datetime, granularity: str = "hour"
) -> list[dict[str, int]]:
    """
    Get time-series click data for sparklines.
    granularity: "hour", "day", "month"
    Returns list of {timestamp: str (ISO), value: int}
    Supports both PostgreSQL (date_trunc) and SQLite (strftime).
    """
    link_ids_stmt = select(Link.id).where(Link.user_id == user_id)
    
    # Check if using SQLite
    is_sqlite = settings.database_url.startswith("sqlite")
    
    # Determine date truncation based on database and granularity
    if is_sqlite:
        # SQLite uses strftime for date truncation
        if granularity == "hour":
            trunc_func = func.strftime("%Y-%m-%d %H:00:00", ClickEvent.clicked_at)
        elif granularity == "day":
            trunc_func = func.date(ClickEvent.clicked_at)
        elif granularity == "month":
            trunc_func = func.strftime("%Y-%m-01 00:00:00", ClickEvent.clicked_at)
        else:
            trunc_func = func.strftime("%Y-%m-%d %H:00:00", ClickEvent.clicked_at)
    else:
        # PostgreSQL uses date_trunc
        if granularity == "hour":
            trunc_func = func.date_trunc("hour", ClickEvent.clicked_at)
        elif granularity == "day":
            trunc_func = func.date_trunc("day", ClickEvent.clicked_at)
        elif granularity == "month":
            trunc_func = func.date_trunc("month", ClickEvent.clicked_at)
        else:
            trunc_func = func.date_trunc("hour", ClickEvent.clicked_at)
    
    stmt = (
        select(
            trunc_func.label("time_bucket"),
            func.count(ClickEvent.id).label("count")
        )
        .where(
            ClickEvent.link_id.in_(link_ids_stmt),
            ClickEvent.clicked_at >= start_date,
            ClickEvent.clicked_at <= end_date,
        )
        .group_by(trunc_func)
        .order_by(trunc_func)
    )
    
    results = db.execute(stmt).all()
    
    # Convert results to proper format
    formatted_results = []
    for row in results:
        time_bucket = row.time_bucket
        
        # For SQLite, time_bucket is a string, convert to datetime
        if isinstance(time_bucket, str):
            try:
                # Parse SQLite date/time formats
                if granularity == "hour":
                    # Format: "YYYY-MM-DD HH:00:00"
                    time_bucket = datetime.strptime(time_bucket, "%Y-%m-%d %H:00:00")
                elif granularity == "day":
                    # Format: "YYYY-MM-DD"
                    time_bucket = datetime.strptime(time_bucket, "%Y-%m-%d")
                elif granularity == "month":
                    # Format: "YYYY-MM-01 00:00:00"
                    time_bucket = datetime.strptime(time_bucket, "%Y-%m-%d %H:%M:%S")
                else:
                    time_bucket = datetime.strptime(time_bucket, "%Y-%m-%d %H:00:00")
                # Make timezone-aware (assume UTC)
                if time_bucket.tzinfo is None:
                    time_bucket = time_bucket.replace(tzinfo=timezone.utc)
            except (ValueError, TypeError) as e:
                # If parsing fails, log and skip this row
                print(f"Warning: Failed to parse time_bucket '{time_bucket}': {e}")
                continue
        
        # Convert to ISO format string
        if isinstance(time_bucket, datetime):
            timestamp_str = time_bucket.isoformat()
        else:
            # Fallback: use string as-is (shouldn't happen)
            timestamp_str = str(time_bucket)
        
        formatted_results.append({
            "timestamp": timestamp_str,
            "value": int(row.count),
        })
    
    return formatted_results


def get_previous_period_metrics(
    db: Session, *, user_id: int, current_start: datetime, current_end: datetime
) -> dict[str, int]:
    """
    Get metrics for the previous period (same duration before current period).
    Returns dict with total_clicks, total_links, unique_visitors.
    """
    period_duration = current_end - current_start
    previous_end = current_start
    previous_start = previous_end - period_duration
    
    return {
        "total_clicks": get_total_clicks_for_user(
            db, user_id=user_id, start_date=previous_start, end_date=previous_end
        ),
        "total_links": get_total_links_for_user(db, user_id=user_id),  # Links don't change by period
        "unique_visitors": get_unique_visitors_for_user(
            db, user_id=user_id, start_date=previous_start, end_date=previous_end
        ),
    }


def update_link_status(db: Session, *, user_id: int, link_id: int, is_active: bool) -> Link | None:
    """Update the active status of a link. Returns the updated link or None if not found."""
    link = get_link_for_user(db, user_id=user_id, link_id=link_id)
    if not link:
        return None
    
    link.is_active = is_active
    db.commit()
    db.refresh(link)
    return link

