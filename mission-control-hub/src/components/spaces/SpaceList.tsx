'use client'

import { useState, useEffect } from 'react'

interface Space {
  id: string
  name: string
  type: 'personal' | 'team'
  icon: string
  color: string
  description?: string
}

export function SpaceList() {
  const [spaces, setSpaces] = useState<Space[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/spaces')
      .then(res => res.json())
      .then(data => {
        setSpaces(data.docs || [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="grid grid-cols-3 gap-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-32 rounded-xl bg-surface-900 animate-pulse" />
        ))}
      </div>
    )
  }

  if (spaces.length === 0) {
    return (
      <div className="text-center py-12 text-muted">
        <p className="text-4xl mb-4">📂</p>
        <p>No spaces yet. Create your first one!</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-3 gap-4">
      {spaces.map(space => (
        <div
          key={space.id}
          className="p-4 rounded-xl bg-surface-900 border border-surface-800 hover:border-volt-500 transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-3 mb-2">
            <span className="text-2xl">{space.icon}</span>
            <div>
              <h3 className="font-semibold">{space.name}</h3>
              <span className="text-xs text-muted capitalize">{space.type}</span>
            </div>
          </div>
          {space.description && (
            <p className="text-sm text-muted mt-2">{space.description}</p>
          )}
        </div>
      ))}
    </div>
  )
}
