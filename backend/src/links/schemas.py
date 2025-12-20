from __future__ import annotations

from datetime import datetime
from pydantic import BaseModel, HttpUrl


class LinkCreateRequest(BaseModel):
    target_url: HttpUrl


class LinkResponse(BaseModel):
    id: int
    slug: str
    target_url: str
    is_active: bool
    created_at: datetime
    click_count: int
    short_url: str

    model_config = {"from_attributes": True}


class LinkListItem(BaseModel):
    id: int
    slug: str
    target_url: str
    is_active: bool
    created_at: datetime
    click_count: int
    last_clicked_at: datetime | None
    short_url: str

    model_config = {"from_attributes": True}


class ClickEventItem(BaseModel):
    id: int
    clicked_at: datetime
    referrer_host: str | None = None
    country: str | None = None

    model_config = {"from_attributes": True}


class LinkStatsResponse(BaseModel):
    link: LinkListItem
    clicks_last_24h: int
    recent_clicks: list[ClickEventItem]

