// Analytics Types

export type DateRangePreset = '24h' | '7d' | '30d' | 'all' | 'custom'

export interface DateRange {
  start: Date
  end: Date
  preset: DateRangePreset
}

export interface SparklinePoint {
  timestamp: string // ISO datetime
  value: number
}

export interface KPIData {
  title: string
  value: number
  previousValue: number
  delta: number // percentage change
  sparklineData: SparklinePoint[]
  trend: 'up' | 'down' | 'neutral'
}

export interface CountryData {
  countryCode: string // ISO 3166-1 alpha-2 (e.g., "US", "GB")
  countryName: string
  clicks: number
  percentage: number // percentage of total clicks
  uniqueVisitors?: number
}

export interface LinkTableRow {
  id: number
  shortUrl: string
  longUrl: string
  status: 'active' | 'inactive'
  clicks: number
  uniqueVisitors: number
  lastClicked: string | null // ISO datetime
  created: string // ISO datetime
  deleted?: boolean // Soft delete flag - removes from user view but not from DB
}

export interface DashboardFilters {
  status?: 'active' | 'inactive' | 'all'
  search?: string
  sortBy?: 'clicks' | 'lastClicked'
  sortOrder?: 'asc' | 'desc'
}

