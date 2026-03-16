'use client'

import { useState } from 'react'

interface CreateSpaceModalProps {
  open: boolean
  onClose: () => void
  onCreated: () => void
}

export function CreateSpaceModal({ open, onClose, onCreated }: CreateSpaceModalProps) {
  const [name, setName] = useState('')
  const [type, setType] = useState<'personal' | 'team'>('personal')
  const [loading, setLoading] = useState(false)

  if (!open) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await fetch('/api/spaces', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, type }),
      })

      if (res.ok) {
        setName('')
        setType('personal')
        onCreated()
        onClose()
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="bg-surface-900 border border-surface-800 rounded-xl p-6 w-full max-w-md">
        <h2 className="text-xl font-bold font-[family-name:var(--font-heading)] mb-4">
          Create Space
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-muted mb-1">Name</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full px-3 py-2 bg-void border border-surface-700 rounded-lg focus:border-volt-500 focus:outline-none"
              placeholder="My Space"
              required
            />
          </div>

          <div>
            <label className="block text-sm text-muted mb-1">Type</label>
            <select
              value={type}
              onChange={e => setType(e.target.value as 'personal' | 'team')}
              className="w-full px-3 py-2 bg-void border border-surface-700 rounded-lg focus:border-volt-500 focus:outline-none"
            >
              <option value="personal">Personal</option>
              <option value="team">Team</option>
            </select>
          </div>

          <div className="flex gap-3 justify-end mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-muted hover:text-foreground transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !name}
              className="px-4 py-2 bg-volt-500 text-void font-semibold rounded-lg hover:bg-volt-400 transition-colors disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
