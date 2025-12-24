import { useState, useMemo, useRef, useEffect } from 'react'
import type { LinkTableRow } from '@/types/analytics'
import { formatDistanceToNow } from 'date-fns'
import { useTheme } from '@/contexts'

interface LinksTableProps {
  links: LinkTableRow[]
  loading?: boolean
  onRowClick?: (linkId: number) => void
  onActivate?: (linkId: number) => void
  onDeactivate?: (linkId: number) => void
  onDelete?: (linkId: number) => void
}

type SortField = 'clicks' | 'lastClicked'
type SortOrder = 'asc' | 'desc'

export default function LinksTable({ 
  links, 
  loading = false, 
  onRowClick,
  onActivate,
  onDeactivate,
  onDelete,
}: LinksTableProps) {
  const { theme } = useTheme()
  const [sortBy, setSortBy] = useState<SortField | null>('clicks')
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc')
  const [openMenuId, setOpenMenuId] = useState<number | null>(null)
  const menuRefs = useRef<Record<number, HTMLDivElement | null>>({})

  const bgColor = theme === 'dark' ? '#1f2937' : '#ffffff'
  const textColor = theme === 'dark' ? '#f9fafb' : '#111827'
  const textSecondary = theme === 'dark' ? '#d1d5db' : '#6b7280'
  const borderColor = theme === 'dark' ? '#374151' : '#e5e7eb'
  const hoverBg = theme === 'dark' ? '#374151' : '#f9fafb'

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

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (openMenuId !== null) {
        const menuElement = menuRefs.current[openMenuId]
        if (menuElement && !menuElement.contains(event.target as Node)) {
          setOpenMenuId(null)
        }
      }
    }

    if (openMenuId !== null) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [openMenuId])

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

  const handleMenuToggle = (linkId: number, e: React.MouseEvent) => {
    e.stopPropagation()
    setOpenMenuId(openMenuId === linkId ? null : linkId)
  }

  const handleActivate = (linkId: number, e: React.MouseEvent) => {
    e.stopPropagation()
    onActivate?.(linkId)
    setOpenMenuId(null)
  }

  const handleDeactivate = (linkId: number, e: React.MouseEvent) => {
    e.stopPropagation()
    onDeactivate?.(linkId)
    setOpenMenuId(null)
  }

  const handleDelete = (linkId: number, e: React.MouseEvent) => {
    e.stopPropagation()
    onDelete?.(linkId)
    setOpenMenuId(null)
  }

  const handleViewDetails = (linkId: number, e: React.MouseEvent) => {
    e.stopPropagation()
    onRowClick?.(linkId)
    setOpenMenuId(null)
  }

  if (loading) {
    return (
      <div style={{
        background: bgColor,
        borderRadius: '8px',
        padding: '2rem',
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
        textAlign: 'center',
        color: textSecondary,
        transition: 'background-color 0.3s ease, color 0.3s ease',
      }}>
        Loading links...
      </div>
    )
  }

  if (links.length === 0) {
    return (
      <div style={{
        background: bgColor,
        borderRadius: '8px',
        padding: '2rem',
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
        textAlign: 'center',
        color: textSecondary,
        transition: 'background-color 0.3s ease, color 0.3s ease',
      }}>
        <p>No links found</p>
        <p style={{ fontSize: '0.875rem', color: textSecondary, marginTop: '0.5rem' }}>
          Create your first shortened link to get started
        </p>
      </div>
    )
  }

  return (
    <div style={{
      background: bgColor,
      borderRadius: '8px',
      padding: '1.5rem',
      boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
      overflowX: 'auto',
      transition: 'background-color 0.3s ease',
    }}>
      <h3 style={{ 
        fontSize: '1.125rem', 
        fontWeight: '600', 
        color: textColor,
        marginTop: 0,
        marginBottom: '1rem'
      }}>
        Links
      </h3>

      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ borderBottom: `1px solid ${borderColor}` }}>
            <th style={{ 
              textAlign: 'left', 
              padding: '0.75rem 1rem',
              fontSize: '0.75rem',
              fontWeight: '600',
              color: textSecondary,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}>
              Short URL
            </th>
            <th style={{ 
              textAlign: 'left', 
              padding: '0.75rem 1rem',
              fontSize: '0.75rem',
              fontWeight: '600',
              color: textSecondary,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}>
              Long URL
            </th>
            <th style={{ 
              textAlign: 'center', 
              padding: '0.75rem 1rem',
              fontSize: '0.75rem',
              fontWeight: '600',
              color: textSecondary,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}>
              Status
            </th>
            <th 
              style={{ 
                textAlign: 'center', 
                padding: '0.75rem 1rem',
                fontSize: '0.75rem',
                fontWeight: '600',
                color: textSecondary,
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
              textAlign: 'center', 
              padding: '0.75rem 1rem',
              fontSize: '0.75rem',
              fontWeight: '600',
              color: textSecondary,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}>
              Unique Visitors
            </th>
            <th 
              style={{ 
                textAlign: 'left', 
                padding: '0.75rem 1rem',
                fontSize: '0.75rem',
                fontWeight: '600',
                color: textSecondary,
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
              padding: '0.75rem 1rem',
              fontSize: '0.75rem',
              fontWeight: '600',
              color: textSecondary,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}>
              Created
            </th>
            <th style={{ 
              textAlign: 'center', 
              padding: '0.75rem 1rem',
              fontSize: '0.75rem',
              fontWeight: '600',
              color: textSecondary,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              width: '50px',
            }}>
              {/* Actions column header */}
            </th>
          </tr>
        </thead>
        <tbody>
          {sortedLinks.map((link) => (
            <tr
              key={link.id}
              onClick={() => onRowClick?.(link.id)}
              style={{
                borderBottom: `1px solid ${borderColor}`,
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
              <td style={{ padding: '0.75rem 1rem', fontSize: '0.875rem' }}>
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
              <td style={{ padding: '0.75rem 1rem', fontSize: '0.875rem', color: textSecondary, maxWidth: '300px' }}>
                <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={link.longUrl}>
                  {truncateUrl(link.longUrl, 50)}
                </div>
              </td>
              <td style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>
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
              <td style={{ padding: '0.75rem 1rem', textAlign: 'center', fontSize: '0.875rem', fontWeight: '500', color: textColor }}>
                {link.clicks.toLocaleString()}
              </td>
              <td style={{ padding: '0.75rem 1rem', textAlign: 'center', fontSize: '0.875rem', color: textSecondary }}>
                {link.uniqueVisitors.toLocaleString()}
              </td>
              <td style={{ padding: '0.75rem 1rem', fontSize: '0.875rem', color: textSecondary }}>
                {formatDate(link.lastClicked)}
              </td>
              <td style={{ padding: '0.75rem 1rem', fontSize: '0.875rem', color: textSecondary }}>
                {formatDate(link.created)}
              </td>
              <td 
                style={{ 
                  padding: '0.75rem 1rem', 
                  textAlign: 'center',
                  position: 'relative',
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={(e) => handleMenuToggle(link.id, e)}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '0.25rem',
                    borderRadius: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: textSecondary,
                    fontSize: '1.25rem',
                    lineHeight: 1,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = hoverBg
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent'
                  }}
                >
                  ⋮
                </button>
                
                {openMenuId === link.id && (
                  <div
                    ref={(el) => (menuRefs.current[link.id] = el)}
                    style={{
                      position: 'absolute',
                      right: '0.5rem',
                      top: '100%',
                      marginTop: '0.25rem',
                      background: bgColor,
                      borderRadius: '6px',
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                      border: '1px solid #e5e7eb',
                      zIndex: 1000,
                      minWidth: '160px',
                      overflow: 'hidden',
                    }}
                  >
                    <button
                      onClick={(e) => handleViewDetails(link.id, e)}
                      style={{
                        width: '100%',
                        textAlign: 'left',
                        padding: '0.75rem 1rem',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '0.875rem',
                        color: textColor,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#f9fafb'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent'
                      }}
                    >
                      <span>👁️</span>
                      <span>View Details</span>
                    </button>
                    
                    {link.status === 'active' ? (
                      <button
                        onClick={(e) => handleDeactivate(link.id, e)}
                        style={{
                          width: '100%',
                          textAlign: 'left',
                          padding: '0.75rem 1rem',
                          background: 'none',
                          border: 'none',
                          borderTop: '1px solid #e5e7eb',
                          cursor: 'pointer',
                          fontSize: '0.875rem',
                          color: textColor,
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = '#f9fafb'
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'transparent'
                        }}
                      >
                        <span>⏸️</span>
                        <span>Deactivate</span>
                      </button>
                    ) : (
                      <button
                        onClick={(e) => handleActivate(link.id, e)}
                        style={{
                          width: '100%',
                          textAlign: 'left',
                          padding: '0.75rem 1rem',
                          background: 'none',
                          border: 'none',
                          borderTop: '1px solid #e5e7eb',
                          cursor: 'pointer',
                          fontSize: '0.875rem',
                          color: textColor,
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = '#f9fafb'
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'transparent'
                        }}
                      >
                        <span>▶️</span>
                        <span>Activate</span>
                      </button>
                    )}
                    
                    {link.status === 'inactive' && (
                      <button
                        onClick={(e) => handleDelete(link.id, e)}
                        style={{
                          width: '100%',
                          textAlign: 'left',
                          padding: '0.75rem 1rem',
                          background: 'none',
                          border: 'none',
                          borderTop: '1px solid #e5e7eb',
                          cursor: 'pointer',
                          fontSize: '0.875rem',
                          color: '#dc2626',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = '#fef2f2'
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'transparent'
                        }}
                      >
                        <span>🗑️</span>
                        <span>Delete</span>
                      </button>
                    )}
                  </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

