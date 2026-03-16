// Server-Sent Events manager
type EventCallback = (data: string) => void

class EventManager {
  private clients: Map<string, Set<EventCallback>> = new Map()

  subscribe(userId: string, callback: EventCallback) {
    if (!this.clients.has(userId)) {
      this.clients.set(userId, new Set())
    }
    this.clients.get(userId)!.add(callback)

    return () => {
      this.clients.get(userId)?.delete(callback)
      if (this.clients.get(userId)?.size === 0) {
        this.clients.delete(userId)
      }
    }
  }

  emit(userId: string, event: { type: string; data: unknown }) {
    const callbacks = this.clients.get(userId)
    if (callbacks) {
      const payload = JSON.stringify(event)
      callbacks.forEach(cb => cb(payload))
    }
  }

  broadcast(event: { type: string; data: unknown }) {
    const payload = JSON.stringify(event)
    this.clients.forEach(callbacks => {
      callbacks.forEach(cb => cb(payload))
    })
  }
}

// Singleton
export const eventManager = new EventManager()
