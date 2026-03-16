'use client'

import { useState, useEffect } from 'react'
import { KanbanBoard } from '@/components/kanban/KanbanBoard'
import { BoardSkeleton } from '@/components/ui/Skeleton'

interface Space {
  id: string
  name: string
  icon: string
}

export default function BoardPage() {
  const [spaces, setSpaces] = useState<Space[]>([])
  const [selectedSpace, setSelectedSpace] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/spaces')
      .then(res => {
        if (!res.ok) throw new Error('Failed to load spaces')
        return res.json()
      })
      .then(data => {
        const docs = data.docs || []
        setSpaces(docs)
        if (docs.length > 0) setSelectedSpace(docs[0].id)
        setLoading(false)
      })
      .catch(err => {
        setError(err.message)
        setLoading(false)
      })
  }, [])

  if (loading) {
    return <BoardSkeleton />
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-[family-name:var(--font-heading)]">
            Mission Board
          </h1>
          <p className="text-muted mt-1">Drag and drop to organize your tasks.</p>
        </div>

        {spaces.length > 1 && (
          <select
            value={selectedSpace || ''}
            onChange={e => setSelectedSpace(e.target.value)}
            className="px-3 py-2 bg-surface-900 border border-surface-800 rounded-lg text-sm focus:border-volt-500 focus:outline-none"
          >
            {spaces.map(space => (
              <option key={space.id} value={space.id}>
                {space.icon} {space.name}
              </option>
            ))}
          </select>
        )}
      </div>

      {selectedSpace ? (
        <KanbanBoard spaceId={selectedSpace} />
      ) : (
        <div className="rounded-xl bg-surface-900 border border-surface-800 p-12 text-center text-muted">
          <p className="text-4xl mb-4">📋</p>
          <p>Create a space first to start using the board.</p>
          <p className="text-xs mt-2">Go to Spaces → Create New Space</p>
        </div>
      )}
    </div>
  )
}
