import { useState, useMemo } from 'react'
import type { LinkTableRow } from '@/types/analytics'
import { formatDistanceToNow } from 'date-fns'

interface LinksTableProps {
  links: LinkTableRow[]
  loading?: boolean
  onRowClick?: (linkId: number) => void
}

type SortField = 'clicks' | 'lastClicked'
type SortOrder = 'asc' | 'desc'

export default function LinksTable({ links, loading = false, onRowClick }: LinksTableProps) {
  const [sortBy, setSortBy] = useState<SortField | null>('clicks')
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc')

  const handleSort = (field: SortField) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(field)
      setSortOrder('desc')
    }
  }

  const sortedLinks = useMemo(() => {
    if (!sortBy) return links

    return [...links].sort((a, b) => {
      let aValue: number | string | null
      let bValue: number | string | null

      if (sortBy === 'clicks') {
        aValue = a.clicks
        bValue = b.clicks
      } else if (sortBy === 'lastClicked') {
        aValue = a.lastClicked
        bValue = b.lastClicked
      } else {
        return 0
      }

      if (aValue === null && bValue === null) return 0
      if (aValue === null) return 1
      if (bValue === null) return -1

      const comparison = aValue < bValue ? -1 : aValue > bValue ? 1 : 0
      return sortOrder === 'asc' ? comparison : -comparison
    })
  }, [links, sortBy, sortOrder])

  const formatDate = (dateString: string | null): string => {
    if (!dateString) return 'Never'
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true })
    } catch {
      return 'Invalid date'
    }
  }

  const truncateUrl = (url: string, maxLength: number = 50): string => {
    if (url.length <= maxLength) return url
    return url.substring(0, maxLength) + '...'
  }

  if (loading) {
    return (
      <div style={{
        background: 'white',
        borderRadius: '8px',
        padding: '2rem',
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
        textAlign: 'center',
        color: '#6b7280',
      }}>
        Loading links...
      </div>
    )
  }

  if (links.length === 0) {
    return (
      <div style={{
        background: 'white',
        borderRadius: '8px',
        padding: '2rem',
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
        textAlign: 'center',
        color: '#6b7280',
      }}>
        <p>No links found</p>
        <p style={{ fontSize: '0.875rem', color: '#9ca3af', marginTop: '0.5rem' }}>
          Create your first shortened link to get started
        </p>
      </div>
    )
  }

  return (
    <div style={{
      background: 'white',
      borderRadius: '8px',
      padding: '1.5rem',
      boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
      overflowX: 'auto',
    }}>
      <h3 style={{ 
        fontSize: '1.125rem', 
        fontWeight: '600', 
        color: '#111827',
        marginTop: 0,
        marginBottom: '1rem'
      }}>
        Links
      </h3>

      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
            <th style={{ 
              textAlign: 'left', 
              padding: '0.75rem 0.5rem',
              fontSize: '0.75rem',
              fontWeight: '600',
              color: '#6b7280',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}>
              Short URL
            </th>
            <th style={{ 
              textAlign: 'left', 
              padding: '0.75rem 0.5rem',
              fontSize: '0.75rem',
              fontWeight: '600',
              color: '#6b7280',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}>
              Long URL
            </th>
            <th style={{ 
              textAlign: 'left', 
              padding: '0.75rem 0.5rem',
              fontSize: '0.75rem',
              fontWeight: '600',
              color: '#6b7280',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}>
              Status
            </th>
            <th 
              style={{ 
                textAlign: 'right', 
                padding: '0.75rem 0.5rem',
                fontSize: '0.75rem',
                fontWeight: '600',
                color: '#6b7280',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                cursor: 'pointer',
                userSelect: 'none',
              }}
              onClick={() => handleSort('clicks')}
            >
              Clicks {sortBy === 'clicks' && (sortOrder === 'asc' ? '↑' : '↓')}
            </th>
            <th style={{ 
              textAlign: 'right', 
              padding: '0.75rem 0.5rem',
              fontSize: '0.75rem',
              fontWeight: '600',
              color: '#6b7280',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}>
              Unique Visitors
            </th>
            <th 
              style={{ 
                textAlign: 'left', 
                padding: '0.75rem 0.5rem',
                fontSize: '0.75rem',
                fontWeight: '600',
                color: '#6b7280',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                cursor: 'pointer',
                userSelect: 'none',
              }}
              onClick={() => handleSort('lastClicked')}
            >
              Last Clicked {sortBy === 'lastClicked' && (sortOrder === 'asc' ? '↑' : '↓')}
            </th>
            <th style={{ 
              textAlign: 'left', 
              padding: '0.75rem 0.5rem',
              fontSize: '0.75rem',
              fontWeight: '600',
              color: '#6b7280',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}>
              Created
            </th>
          </tr>
        </thead>
        <tbody>
          {sortedLinks.map((link) => (
            <tr
              key={link.id}
              onClick={() => onRowClick?.(link.id)}
              style={{
                borderBottom: '1px solid #f3f4f6',
                cursor: onRowClick ? 'pointer' : 'default',
                transition: 'background-color 0.15s ease',
              }}
              onMouseEnter={(e) => {
                if (onRowClick) {
                  e.currentTarget.style.backgroundColor = '#f9fafb'
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent'
              }}
            >
              <td style={{ padding: '0.75rem 0.5rem', fontSize: '0.875rem' }}>
                <a
                  href={link.shortUrl}
                  onClick={(e) => e.stopPropagation()}
                  style={{ color: '#3b82f6', textDecoration: 'none' }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.textDecoration = 'underline'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.textDecoration = 'none'
                  }}
                >
                  {link.shortUrl}
                </a>
              </td>
              <td style={{ padding: '0.75rem 0.5rem', fontSize: '0.875rem', color: '#6b7280', maxWidth: '300px' }}>
                <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={link.longUrl}>
                  {truncateUrl(link.longUrl, 50)}
                </div>
              </td>
              <td style={{ padding: '0.75rem 0.5rem' }}>
                <span style={{
                  display: 'inline-block',
                  padding: '0.25rem 0.75rem',
                  borderRadius: '9999px',
                  fontSize: '0.75rem',
                  fontWeight: '500',
                  background: link.status === 'active' ? '#d1fae5' : '#fee2e2',
                  color: link.status === 'active' ? '#065f46' : '#991b1b',
                }}>
                  {link.status === 'active' ? 'Active' : 'Inactive'}
                </span>
              </td>
              <td style={{ padding: '0.75rem 0.5rem', textAlign: 'right', fontSize: '0.875rem', fontWeight: '500' }}>
                {link.clicks.toLocaleString()}
              </td>
              <td style={{ padding: '0.75rem 0.5rem', textAlign: 'right', fontSize: '0.875rem', color: '#6b7280' }}>
                {link.uniqueVisitors.toLocaleString()}
              </td>
              <td style={{ padding: '0.75rem 0.5rem', fontSize: '0.875rem', color: '#6b7280' }}>
                {formatDate(link.lastClicked)}
              </td>
              <td style={{ padding: '0.75rem 0.5rem', fontSize: '0.875rem', color: '#6b7280' }}>
                {formatDate(link.created)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

