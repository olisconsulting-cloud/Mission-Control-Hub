'use client'

import { useState, useEffect } from 'react'

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

  useEffect(() => {
    fetch('/api/activities')
      .then(res => res.json())
      .then(data => {
        setActivities(data.docs || [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  if (loading) {
    return <div className="animate-pulse h-96 rounded-xl bg-surface-900" />
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-[family-name:var(--font-heading)]">Activity Feed</h1>
        <p className="text-muted mt-1">Recent actions across your spaces.</p>
      </div>

      {activities.length === 0 ? (
        <div className="text-center py-12 text-muted">
          <p className="text-4xl mb-4">📜</p>
          <p>No activity yet. Start creating tasks and chatting with agents!</p>
        </div>
      ) : (
        <div className="space-y-2">
          {activities.map(activity => (
            <div
              key={activity.id}
              className="flex items-start gap-3 p-4 rounded-xl bg-surface-900 border border-surface-800"
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
      )}
    </div>
  )
}
