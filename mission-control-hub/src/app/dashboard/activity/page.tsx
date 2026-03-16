'use client'

import { useState, useEffect } from 'react'
import { TableSkeleton } from '@/components/ui/Skeleton'

interface Activity {
  id: string
  type: string
  message: string
  user: { name: string } | string
  createdAt: string
}

const typeIcons: Record<string, string> = {
  task_created: '📝',
  task_moved: '➡️',
  task_completed: '✅',
  task_deleted: '🗑️',
  agent_chat: '🤖',
  space_created: '📂',
  team_created: '👥',
  member_joined: '🤝',
}

export default function ActivityPage() {
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const ITEMS_PER_PAGE = 20

  useEffect(() => {
    setLoading(true)
    setError(null)
    fetch(`/api/activities?page=${page}&limit=${ITEMS_PER_PAGE}`)
      .then(res => {
        if (!res.ok) throw new Error('Failed to load activity')
        return res.json()
      })
      .then(data => {
        setActivities(data.docs || [])
        setHasMore(data.hasNextPage || false)
        setLoading(false)
      })
      .catch(err => {
        setError(err.message)
        setLoading(false)
      })
  }, [page])

  if (loading) {
    return <TableSkeleton rows={10} />
  }

  if (error) {
    return (
      <div className="rounded-xl bg-surface-900 border border-red-500/30 p-8 text-center">
        <p className="text-3xl mb-4">⚠️</p>
        <p className="text-red-400">{error}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-[family-name:var(--font-heading)]">Activity Feed</h1>
        <p className="text-muted mt-1">Recent actions across your spaces.</p>
      </div>

      {activities.length === 0 ? (
        <div className="rounded-xl bg-surface-900 border border-surface-800 p-12 text-center text-muted">
          <p className="text-4xl mb-4">📜</p>
          <p>No activity yet. Start creating tasks and chatting with agents!</p>
        </div>
      ) : (
        <>
          <div className="space-y-2">
            {activities.map(activity => (
              <div
                key={activity.id}
                className="flex items-start gap-3 p-4 rounded-xl bg-surface-900 border border-surface-800 hover:border-surface-700 transition-colors"
              >
                <span className="text-lg mt-0.5">
                  {typeIcons[activity.type] || '📌'}
                </span>
                <div className="flex-1">
                  <p className="text-sm">{activity.message}</p>
                  <p className="text-xs text-muted mt-1">
                    {new Date(activity.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {(page > 1 || hasMore) && (
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 border border-surface-700 rounded-lg text-sm hover:bg-surface-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ← Previous
              </button>
              <span className="text-sm text-muted">Page {page}</span>
              <button
                onClick={() => setPage(p => p + 1)}
                disabled={!hasMore}
                className="px-4 py-2 border border-surface-700 rounded-lg text-sm hover:bg-surface-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
