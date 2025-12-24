import apiClient from './client'
import type {
  LinkCreateRequest,
  LinkResponse,
  LinkListItem,
  LinkStatsResponse,
} from '@/types/api'

/**
 * Links API endpoints
 */

/**
 * Create a new shortened link
 */
export const createLink = async (data: LinkCreateRequest): Promise<LinkResponse> => {
  const response = await apiClient.post<LinkResponse>('/api/links', data)
  return response.data
}

/**
 * Get list of user's links with pagination
 */
export const getLinks = async (
  limit: number = 10,
  offset: number = 0
): Promise<LinkListItem[]> => {
  const response = await apiClient.get<LinkListItem[]>('/api/links', {
    params: { limit, offset },
  })
  return response.data
}

/**
 * Get statistics for a specific link
 */
export const getLinkStats = async (linkId: number): Promise<LinkStatsResponse> => {
  const response = await apiClient.get<LinkStatsResponse>(`/api/links/${linkId}/stats`)
  return response.data
}

/**
 * Get dashboard analytics data
 */
export const getDashboardData = async (
  startDate: string, // ISO datetime string
  endDate: string    // ISO datetime string
): Promise<import('@/types/api').DashboardResponse> => {
  const response = await apiClient.get<import('@/types/api').DashboardResponse>('/api/links/dashboard', {
    params: {
      start_date: startDate,
      end_date: endDate,
    },
  })
  return response.data
}

/**
 * Update link status (activate/deactivate)
 */
export const updateLinkStatus = async (
  linkId: number,
  isActive: boolean
): Promise<LinkListItem> => {
  const response = await apiClient.patch<LinkListItem>(
    `/api/links/${linkId}/status?is_active=${isActive}`,
    {}
  )
  return response.data
}

