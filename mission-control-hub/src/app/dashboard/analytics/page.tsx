'use client'

import { useState, useEffect } from 'react'

interface AnalyticsData {
  tasks: {
    total: number
    byStatus: Record<string, number>
    byPriority: Record<string, number>
    weeklyVelocity: number
    completionRate: number
  }
  agents: {
    totalCalls: number
    avgResponseTimeMs: number
    successRate: number
  }
  activity: {
    totalActions: number
    activeDaysLast30: number
  }
}

const statusLabels: Record<string, { label: string; color: string }> = {
  backlog: { label: 'Backlog', color: 'bg-gray-500' },
  todo: { label: 'Todo', color: 'bg-blue-500' },
  'in-progress': { label: 'In Progress', color: 'bg-yellow-500' },
  review: { label: 'Review', color: 'bg-purple-500' },
  done: { label: 'Done', color: 'bg-volt-500' },
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/analytics')
      .then(res => res.json())
      .then(d => { setData(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  if (loading) return <div className="animate-pulse h-96 rounded-xl bg-surface-900" />

  if (!data) return <p className="text-muted">Failed to load analytics.</p>

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold font-[family-name:var(--font-heading)]">Intelligence</h1>
        <p className="text-muted mt-1">Analytics, insights, and performance metrics.</p>
      </div>

      {/* Top Stats */}
      <div className="grid grid-cols-4 gap-4">
        <StatCard title="Total Tasks" value={data.tasks.total} icon="📋" />
        <StatCard title="Weekly Velocity" value={data.tasks.weeklyVelocity} icon="🚀" suffix=" done" />
        <StatCard title="Completion Rate" value={data.tasks.completionRate} icon="✅" suffix="%" />
        <StatCard title="Agent Success" value={data.agents.successRate} icon="🤖" suffix="%" />
      </div>

      {/* Task Distribution */}
      <div className="grid grid-cols-2 gap-6">
        <div className="rounded-xl bg-surface-900 border border-surface-800 p-6">
          <h2 className="font-semibold mb-4">Task Status Distribution</h2>
          <div className="space-y-3">
            {Object.entries(data.tasks.byStatus).map(([status, count]) => {
              const info = statusLabels[status] || { label: status, color: 'bg-gray-500' }
              const percent = data.tasks.total > 0 ? Math.round((count / data.tasks.total) * 100) : 0
              return (
                <div key={status}>
                  <div className="flex justify-between text-sm mb-1">
                    <span>{info.label}</span>
                    <span className="text-muted">{count} ({percent}%)</span>
                  </div>
                  <div className="h-2 bg-surface-800 rounded-full overflow-hidden">
                    <div className={`h-full ${info.color} rounded-full`} style={{ width: `${percent}%` }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="rounded-xl bg-surface-900 border border-surface-800 p-6">
          <h2 className="font-semibold mb-4">Priority Breakdown</h2>
          <div className="space-y-3">
            {Object.entries(data.tasks.byPriority).map(([priority, count]) => (
              <div key={priority} className="flex items-center justify-between">
                <span className="text-sm capitalize">{priority}</span>
                <div className="flex items-center gap-3">
                  <div className="w-32 h-2 bg-surface-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-volt-500 rounded-full"
                      style={{ width: `${data.tasks.total > 0 ? (count / data.tasks.total) * 100 : 0}%` }}
                    />
                  </div>
                  <span className="text-sm text-muted w-8 text-right">{count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Agent Performance */}
      <div className="rounded-xl bg-surface-900 border border-surface-800 p-6">
        <h2 className="font-semibold mb-4">Agent Performance</h2>
        <div className="grid grid-cols-3 gap-6">
          <div>
            <p className="text-muted text-sm">Total API Calls</p>
            <p className="text-2xl font-bold mt-1">{data.agents.totalCalls}</p>
          </div>
          <div>
            <p className="text-muted text-sm">Avg Response Time</p>
            <p className="text-2xl font-bold mt-1">{data.agents.avgResponseTimeMs}ms</p>
          </div>
          <div>
            <p className="text-muted text-sm">Success Rate</p>
            <p className="text-2xl font-bold mt-1">{data.agents.successRate}%</p>
          </div>
        </div>
      </div>

      {/* Activity Overview */}
      <div className="rounded-xl bg-surface-900 border border-surface-800 p-6">
        <h2 className="font-semibold mb-4">Activity Overview</h2>
        <div className="grid grid-cols-2 gap-6">
          <div>
            <p className="text-muted text-sm">Total Actions</p>
            <p className="text-2xl font-bold mt-1">{data.activity.totalActions}</p>
          </div>
          <div>
            <p className="text-muted text-sm">Active Days (Last 30)</p>
            <p className="text-2xl font-bold mt-1">{data.activity.activeDaysLast30}/30</p>
          </div>
        </div>
      </div>
    </div>
  )
}

function StatCard({ title, value, icon, suffix = '' }: { title: string; value: number; icon: string; suffix?: string }) {
  return (
    <div className="p-4 rounded-xl bg-surface-900 border border-surface-800">
      <div className="flex items-center gap-2 mb-2">
        <span>{icon}</span>
        <span className="text-sm text-muted">{title}</span>
      </div>
      <p className="text-2xl font-bold text-volt-400">{value}{suffix}</p>
    </div>
  )
}
