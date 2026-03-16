'use client'

import { useEffect, useCallback, useRef } from 'react'

type EventHandler = (event: { type: string; data: unknown }) => void

export function useEvents(onEvent: EventHandler) {
  const eventSourceRef = useRef<EventSource | null>(null)
  const onEventRef = useRef(onEvent)
  onEventRef.current = onEvent

  const connect = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close()
    }

    const es = new EventSource('/api/events')

    es.onmessage = (event) => {
      try {
        const parsed = JSON.parse(event.data)
        onEventRef.current(parsed)
      } catch {
        // Ignore parse errors (heartbeats etc.)
      }
    }

    es.onerror = () => {
      es.close()
      // Reconnect after 5s
      setTimeout(connect, 5000)
    }

    eventSourceRef.current = es
  }, [])

  useEffect(() => {
    connect()
    return () => {
      eventSourceRef.current?.close()
    }
  }, [connect])
}
