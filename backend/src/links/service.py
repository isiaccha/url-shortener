from __future__ import annotations

from datetime import datetime, timezone, timedelta

from sqlalchemy import select, func, desc
from sqlalchemy.orm import Session

from src.links.slug import slug_for_id
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


def record_click(db: Session, *, link: Link) -> None:
    evt = ClickEvent(link_id=link.id)
    db.add(evt)

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

