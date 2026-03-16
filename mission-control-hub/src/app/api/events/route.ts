import { auth } from '@/lib/auth'
import { eventManager } from '@/lib/events'

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return new Response('Unauthorized', { status: 401 })
  }

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

      // Heartbeat every 30s
      const heartbeat = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(': heartbeat\n\n'))
        } catch {
          clearInterval(heartbeat)
          unsubscribe()
        }
      }, 30000)
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  })
}
