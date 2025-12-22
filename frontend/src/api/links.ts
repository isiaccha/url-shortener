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

