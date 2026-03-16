'use client'

import { CardSkeleton } from '@/components/ui/Skeleton'
import { useState, useEffect } from 'react'

interface Team {
  id: string
  name: string
  memberCount: number
  createdAt: string
}

export default function TeamsPage() {
  const [teams, setTeams] = useState<Team[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // Placeholder for future API call
    setLoading(false)
  }, [])

  if (loading) {
    return (
      <div className="space-y-6">
        <CardSkeleton />
        <div className="grid grid-cols-3 gap-6">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-[family-name:var(--font-heading)]">Teams</h1>
        <p className="text-muted mt-1">Collaborate with your team members.</p>
      </div>

      <div className="rounded-xl bg-surface-900 border border-surface-800 p-12 text-center text-muted">
        <p className="text-4xl mb-4">👥</p>
        <p className="mb-2">Team management coming in Phase 2.</p>
        <p className="text-xs">Create teams, invite members, and manage permissions.</p>
      </div>
    </div>
  )
}
