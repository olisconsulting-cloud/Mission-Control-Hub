'use client'

import { useState } from 'react'
import { SpaceList } from '@/components/spaces/SpaceList'
import { CreateSpaceModal } from '@/components/spaces/CreateSpaceModal'

export default function SpacesPage() {
  const [showCreate, setShowCreate] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

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

      <SpaceList key={refreshKey} />

      <CreateSpaceModal
        open={showCreate}
        onClose={() => setShowCreate(false)}
        onCreated={() => setRefreshKey(k => k + 1)}
      />
    </div>
  )
}
