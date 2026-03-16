import { requireAuth, handleAuthError } from '@/lib/authorization'
import { eventManager } from '@/lib/events'

export async function GET() {
  try {
    const session = await requireAuth()
    const userId = session.user.id
    const encoder = new TextEncoder()

    const stream = new ReadableStream({
      start(controller) {
        // Send initial connection event
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ type: 'connected', data: { userId } })}\n\n`)
        )

        // Subscribe to events
        const unsubscribe = eventManager.subscribe(userId, (data) => {
          try {
            controller.enqueue(encoder.encode(`data: ${data}\n\n`))
          } catch {
            unsubscribe()
          }
        })

        // Heartbeat every 60s (increased from 30s for better reliability)
        const heartbeat = setInterval(() => {
          try {
            controller.enqueue(encoder.encode(': heartbeat\n\n'))
          } catch {
            clearInterval(heartbeat)
            unsubscribe()
          }
        }, 60000)
      },
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    })
  } catch (error) {
    if (error instanceof Error && error.name === 'AuthError') {
      return handleAuthError(error)
    }
    return new Response('Internal error', { status: 500 })
  }
}
