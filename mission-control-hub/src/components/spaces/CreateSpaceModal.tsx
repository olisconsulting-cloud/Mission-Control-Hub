'use client'

import { useState, useEffect, useRef } from 'react'
import { z } from 'zod'

interface CreateSpaceModalProps {
  open: boolean
  onClose: () => void
  onCreated: () => void
}

const spaceSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name must be less than 100 characters'),
  type: z.enum(['personal', 'team']),
})

export function CreateSpaceModal({ open, onClose, onCreated }: CreateSpaceModalProps) {
  const [name, setName] = useState('')
  const [type, setType] = useState<'personal' | 'team'>('personal')
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<{ name?: string }>({})
  
  const firstInputRef = useRef<HTMLInputElement>(null)
  const lastButtonRef = useRef<HTMLButtonElement>(null)
  const modalRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) {
        onClose()
      }
    }

    const handleTab = (e: KeyboardEvent) => {
      if (!open || e.key !== 'Tab') return
      
      const focusableElements = modalRef.current?.querySelectorAll(
        'input, button, select, textarea, [tabindex]:not([tabindex="-1"])'
      )
      
      if (!focusableElements || focusableElements.length === 0) return
      
      const firstElement = focusableElements[0] as HTMLElement
      const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement
      
      if (e.shiftKey && document.activeElement === firstElement) {
        e.preventDefault()
        lastElement.focus()
      } else if (!e.shiftKey && document.activeElement === lastElement) {
        e.preventDefault()
        firstElement.focus()
      }
    }

    if (open) {
      document.addEventListener('keydown', handleEscape)
      document.addEventListener('keydown', handleTab)
      firstInputRef.current?.focus()
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.removeEventListener('keydown', handleTab)
    }
  }, [open, onClose])

  if (!open) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})

    try {
      const validated = spaceSchema.parse({ name, type })
      setLoading(true)

      const res = await fetch('/api/spaces', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validated),
      })

      if (res.ok) {
        setName('')
        setType('personal')
        onCreated()
        onClose()
      } else {
        const data = await res.json()
        setErrors({ name: data.error || 'Failed to create space' })
      }
    } catch (err) {
      if (err instanceof z.ZodError) {
        setErrors({ name: err.errors[0]?.message })
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div 
        ref={modalRef}
        className="bg-surface-900 border border-surface-800 rounded-xl p-6 w-full max-w-md"
        role="dialog"
        aria-modal="true"
        aria-label="Create new space"
      >
        <h2 className="text-xl font-bold font-[family-name:var(--font-heading)] mb-4">
          Create Space
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="space-name" className="block text-sm text-muted mb-1">Name</label>
            <input
              id="space-name"
              ref={firstInputRef}
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              className={`w-full px-3 py-2 bg-void border rounded-lg focus:outline-none ${
                errors.name 
                  ? 'border-red-500 focus:border-red-500' 
                  : 'border-surface-700 focus:border-volt-500'
              }`}
              placeholder="My Space"
              required
              maxLength={100}
            />
            {errors.name && (
              <p className="text-xs text-red-400 mt-1">{errors.name}</p>
            )}
          </div>

          <div>
            <label htmlFor="space-type" className="block text-sm text-muted mb-1">Type</label>
            <select
              id="space-type"
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
              ref={lastButtonRef}
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
