'use client'

import { useState, useEffect } from 'react'

interface Space {
  id: string
  name: string
  icon: string
  type: string
}

interface SpaceSwitcherProps {
  onSelect?: (spaceId: string) => void
}

export function SpaceSwitcher({ onSelect }: SpaceSwitcherProps) {
  const [spaces, setSpaces] = useState<Space[]>([])
  const [selected, setSelected] = useState<string | null>(null)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    fetch('/api/spaces')
      .then(res => res.json())
      .then(data => {
        const docs = data.docs || []
        setSpaces(docs)
        if (docs.length > 0 && !selected) {
          setSelected(docs[0].id)
        }
      })
  }, [selected])

  const current = spaces.find(s => s.id === selected)

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-surface-800 hover:bg-surface-700 transition-colors w-full"
      >
        <span>{current?.icon || '📂'}</span>
        <span className="flex-1 text-left text-sm truncate">
          {current?.name || 'Select Space'}
        </span>
        <span className="text-muted text-xs">{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-surface-900 border border-surface-800 rounded-lg shadow-xl z-50 overflow-hidden">
          {spaces.map(space => (
            <button
              key={space.id}
              onClick={() => {
                setSelected(space.id)
                setOpen(false)
                onSelect?.(space.id)
              }}
              className={`flex items-center gap-2 px-3 py-2 w-full text-left hover:bg-surface-800 transition-colors text-sm ${
                space.id === selected ? 'bg-surface-800 text-volt-400' : ''
              }`}
            >
              <span>{space.icon}</span>
              <span>{space.name}</span>
              <span className="ml-auto text-xs text-muted capitalize">{space.type}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
