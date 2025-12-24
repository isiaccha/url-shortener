// API Types matching backend Pydantic schemas

export interface User {
  id: number
  email: string
  display_name: string | null
  avatar_url: string | null
}

export interface LinkCreateRequest {
  target_url: string
}

export interface LinkResponse {
  id: number
  slug: string
  target_url: string
  is_active: boolean
  created_at: string // ISO datetime string
  click_count: number
  short_url: string
}

export interface LinkListItem {
  id: number
  slug: string
  target_url: string
  is_active: boolean
  created_at: string // ISO datetime string
  click_count: number
  last_clicked_at: string | null // ISO datetime string
  short_url: string
}

export interface ClickEventItem {
  id: number
  clicked_at: string // ISO datetime string
  referrer_host: string | null
  country: string | null
  device_category: string | null
  browser_name: string | null
  browser_version: string | null
  os_name: string | null
  os_version: string | null
  engine: string | null
}

export interface LinkStatsResponse {
  link: LinkListItem
  clicks_last_24h: number
  unique_visitors: number
  recent_clicks: ClickEventItem[]
}

// Auth response types
export interface AuthMeResponse {
  user: User
}

export interface LogoutResponse {
  ok: boolean
}

// API Error response
export interface ApiError {
  detail: string
}

// Dashboard analytics types
export interface SparklinePoint {
  timestamp: string // ISO datetime
  value: number
}

export interface KPIData {
  total_clicks: number
  total_links: number
  unique_visitors: number
  previous_period_clicks: number
  previous_period_links: number
  previous_period_unique_visitors: number
}

export interface CountryData {
  country_code: string // ISO 3166-1 alpha-2 (e.g., "US", "GB")
  country_name: string
  clicks: number
  unique_visitors: number
  percentage: number
}

export interface LinkTableData {
  id: number
  short_url: string
  long_url: string
  status: string // "active" | "inactive"
  clicks: number
  unique_visitors: number
  last_clicked: string | null // ISO datetime
  created: string // ISO datetime
}

export interface DashboardResponse {
  kpis: KPIData
  sparkline_data: SparklinePoint[]
  countries: CountryData[]
  links: LinkTableData[]
}

