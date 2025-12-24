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
    device_category: str | None = None
    browser_name: str | None = None
    browser_version: str | None = None
    os_name: str | None = None
    os_version: str | None = None
    engine: str | None = None

    model_config = {"from_attributes": True}


class LinkStatsResponse(BaseModel):
    link: LinkListItem
    clicks_last_24h: int
    recent_clicks: list[ClickEventItem]


# Dashboard analytics schemas

class SparklinePoint(BaseModel):
    timestamp: str  # ISO datetime
    value: int


class KPIData(BaseModel):
    total_clicks: int
    total_links: int
    unique_visitors: int
    previous_period_clicks: int
    previous_period_links: int
    previous_period_unique_visitors: int


class CountryData(BaseModel):
    country_code: str  # ISO 3166-1 alpha-2 (e.g., "US", "GB")
    country_name: str
    clicks: int
    unique_visitors: int
    percentage: float


class LinkTableData(BaseModel):
    id: int
    short_url: str
    long_url: str
    status: str  # "active" | "inactive"
    clicks: int
    unique_visitors: int
    last_clicked: datetime | None
    created: datetime


class DashboardResponse(BaseModel):
    kpis: KPIData
    sparkline_data: list[SparklinePoint]
    countries: list[CountryData]
    links: list[LinkTableData]
