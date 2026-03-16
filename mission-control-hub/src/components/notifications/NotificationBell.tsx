'use client'

import { useState, useEffect } from 'react'

interface Notification {
  id: string
  title: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error'
  read: boolean
  createdAt: string
}

export function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [open, setOpen] = useState(false)

  useEffect(() => {
    fetch('/api/notifications')
      .then(res => res.json())
      .then(data => setNotifications(data.docs || []))
      .catch(() => {})
  }, [])

  const unread = notifications.filter(n => !n.read).length

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 hover:bg-surface-800 rounded-lg transition-colors"
      >
        <span className="text-lg">🔔</span>
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
            {unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-surface-900 border border-surface-800 rounded-xl shadow-xl z-50 overflow-hidden">
          <div className="px-4 py-3 border-b border-surface-800">
            <h3 className="font-semibold text-sm">Notifications</h3>
          </div>
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-muted text-sm">
                No notifications
              </div>
            ) : (
              notifications.slice(0, 10).map(n => (
                <div
                  key={n.id}
                  className={`px-4 py-3 border-b border-surface-800 hover:bg-surface-800 transition-colors ${
                    n.read ? 'opacity-60' : ''
                  }`}
                >
                  <p className="text-sm font-medium">{n.title}</p>
                  <p className="text-xs text-muted mt-1">{n.message}</p>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
