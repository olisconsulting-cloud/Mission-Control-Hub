'use client'

import { useState, useEffect } from 'react'
import { ChartSkeleton } from '@/components/ui/Skeleton'

interface UsageData {
  totalTokens: number
  totalCost: number
  totalCalls: number
  daily: Record<string, { tokens: number; cost: number; calls: number }>
  byModel: Record<string, { tokens: number; cost: number; calls: number }>
}

function formatNumber(n: number): string {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`
  return n.toFixed(0)
}

export default function CostsPage() {
  const [usage, setUsage] = useState<UsageData | null>(null)
  const [days, setDays] = useState(30)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    setError(null)
    fetch(`/api/usage?days=${days}`)
      .then(res => {
        if (!res.ok) throw new Error('Failed to load usage data')
        return res.json()
      })
      .then(data => {
        setUsage(data)
        setLoading(false)
      })
      .catch(err => {
        setError(err.message)
        setLoading(false)
      })
  }, [days])

  if (loading) {
    return (
      <div className="space-y-6">
        <ChartSkeleton />
        <div className="grid grid-cols-3 gap-6">
          <ChartSkeleton />
          <ChartSkeleton />
          <ChartSkeleton />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-xl bg-surface-900 border border-red-500/30 p-8 text-center">
        <p className="text-3xl mb-4">⚠️</p>
        <p className="text-red-400">{error}</p>
      </div>
    )
  }

  const hasData = usage && (usage.totalTokens > 0 || usage.totalCost > 0 || usage.totalCalls > 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-[family-name:var(--font-heading)]">Cost Control</h1>
          <p className="text-muted mt-1">Token usage, costs, and budget tracking.</p>
        </div>
        <select
          value={days}
          onChange={e => setDays(Number(e.target.value))}
          className="px-3 py-2 bg-surface-900 border border-surface-800 rounded-lg text-sm"
        >
          <option value={7}>Last 7 days</option>
          <option value={30}>Last 30 days</option>
          <option value={90}>Last 90 days</option>
        </select>
      </div>

      {!hasData ? (
        <div className="rounded-xl bg-surface-900 border border-surface-800 p-12 text-center">
          <p className="text-4xl mb-4">📊</p>
          <p className="text-muted">No usage data yet for the selected period.</p>
        </div>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-3 gap-6">
            <div className="p-6 rounded-xl bg-surface-900 border border-surface-800">
              <p className="text-muted text-sm">Total Tokens</p>
              <p className="text-3xl font-bold text-volt-400 mt-2">
                {formatNumber(usage?.totalTokens || 0)}
              </p>
            </div>
            <div className="p-6 rounded-xl bg-surface-900 border border-surface-800">
              <p className="text-muted text-sm">Total Cost</p>
              <p className="text-3xl font-bold text-volt-400 mt-2">
                ${(usage?.totalCost || 0).toFixed(2)}
              </p>
            </div>
            <div className="p-6 rounded-xl bg-surface-900 border border-surface-800">
              <p className="text-muted text-sm">API Calls</p>
              <p className="text-3xl font-bold text-volt-400 mt-2">
                {usage?.totalCalls || 0}
              </p>
            </div>
          </div>

          {/* By Model */}
          <div className="rounded-xl bg-surface-900 border border-surface-800 p-6">
            <h2 className="font-semibold mb-4">Usage by Model</h2>
            {usage && Object.keys(usage.byModel).length > 0 ? (
              <div className="space-y-3">
                {Object.entries(usage.byModel)
                  .sort(([, a], [, b]) => b.cost - a.cost)
                  .map(([model, data]) => (
                    <div key={model} className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">{model}</p>
                        <p className="text-xs text-muted">{data.calls} calls</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">${data.cost.toFixed(4)}</p>
                        <p className="text-xs text-muted">{formatNumber(data.tokens)} tokens</p>
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <p className="text-muted text-sm text-center py-4">No model usage data yet.</p>
            )}
          </div>

          {/* Daily Breakdown */}
          <div className="rounded-xl bg-surface-900 border border-surface-800 p-6">
            <h2 className="font-semibold mb-4">Daily Breakdown</h2>
            {usage && Object.keys(usage.daily).length > 0 ? (
              <div className="space-y-2">
                {Object.entries(usage.daily)
                  .sort(([a], [b]) => b.localeCompare(a))
                  .slice(0, 14)
                  .map(([day, data]) => (
                    <div key={day} className="flex items-center gap-4">
                      <span className="text-xs text-muted w-24">{day}</span>
                      <div className="flex-1 h-2 bg-surface-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-volt-500 rounded-full"
                          style={{
                            width: `${Math.min(100, (data.tokens / Math.max(...Object.values(usage.daily).map(d => d.tokens), 1)) * 100)}%`,
                          }}
                        />
                      </div>
                      <span className="text-xs text-muted w-20 text-right">
                        {formatNumber(data.tokens)}
                      </span>
                      <span className="text-xs text-muted w-16 text-right">
                        ${data.cost.toFixed(4)}
                      </span>
                    </div>
                  ))}
              </div>
            ) : (
              <p className="text-muted text-sm text-center py-4">No daily data yet.</p>
            )}
          </div>
        </>
      )}
    </div>
  )
}
