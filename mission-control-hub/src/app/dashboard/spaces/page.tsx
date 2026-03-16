'use client'

import { useState, useEffect } from 'react'
import { CreateSpaceModal } from '@/components/spaces/CreateSpaceModal'
import { CardSkeleton } from '@/components/ui/Skeleton'

interface Space {
  id: string
  name: string
  icon: string
  type: 'personal' | 'team'
  createdAt: string
}

export default function SpacesPage() {
  const [spaces, setSpaces] = useState<Space[]>([])
  const [showCreate, setShowCreate] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadSpaces = () => {
    setLoading(true)
    setError(null)
    fetch('/api/spaces')
      .then(res => {
        if (!res.ok) throw new Error('Failed to load spaces')
        return res.json()
      })
      .then(data => {
        setSpaces(data.docs || [])
        setLoading(false)
      })
      .catch(err => {
        setError(err.message)
        setLoading(false)
      })
  }

  useEffect(() => {
    loadSpaces()
  }, [])

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-16 w-1/2 rounded bg-surface-800 animate-pulse" />
        <div className="grid grid-cols-3 gap-6">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-[family-name:var(--font-heading)]">Spaces</h1>
          <p className="text-muted mt-1">Organize your projects and missions.</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="px-4 py-2 bg-volt-500 text-void font-semibold rounded-lg hover:bg-volt-400 transition-colors"
        >
          + New Space
        </button>
      </div>

      {spaces.length === 0 ? (
        <div className="rounded-xl bg-surface-900 border border-surface-800 p-12 text-center text-muted">
          <p className="text-4xl mb-4">📂</p>
          <p>No spaces yet. Create your first space to get started!</p>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-6">
          {spaces.map(space => (
            <div
              key={space.id}
              className="p-6 rounded-xl bg-surface-900 border border-surface-800 hover:border-volt-500 transition-colors cursor-pointer group"
            >
              <div className="flex items-center gap-3 mb-3">
                <span className="text-3xl">{space.icon}</span>
                <div>
                  <h3 className="font-semibold group-hover:text-volt-400 transition-colors">
                    {space.name}
                  </h3>
                  <span className="text-xs text-muted capitalize">{space.type}</span>
                </div>
              </div>
              <p className="text-xs text-muted">
                Created {new Date(space.createdAt).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
      )}

      <CreateSpaceModal
        open={showCreate}
        onClose={() => setShowCreate(false)}
        onCreated={loadSpaces}
      />
    </div>
  )
}
