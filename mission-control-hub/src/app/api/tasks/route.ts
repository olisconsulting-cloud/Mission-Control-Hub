import { NextResponse, type NextRequest } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { auth } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const spaceId = request.nextUrl.searchParams.get('spaceId')
    if (!spaceId) {
      return NextResponse.json({ error: 'spaceId required' }, { status: 400 })
    }

    const payload = await getPayload({ config })
    const tasks = await payload.find({
      collection: 'tasks',
      where: { space: { equals: spaceId } },
      sort: 'order',
      limit: 500,
    })

    return NextResponse.json(tasks)
  } catch (error) {
    console.error('Failed to fetch tasks:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const payload = await getPayload({ config })

    // Get next order number
    const existing = await payload.find({
      collection: 'tasks',
      where: {
        space: { equals: body.spaceId },
        status: { equals: body.status || 'backlog' },
      },
      sort: '-order',
      limit: 1,
    })

    const nextOrder = existing.docs.length > 0 ? (existing.docs[0].order || 0) + 1 : 0

    const task = await payload.create({
      collection: 'tasks',
      data: {
        title: body.title,
        status: body.status || 'backlog',
        priority: body.priority || 'medium',
        space: body.spaceId,
        assignee: body.assignee || undefined,
        order: nextOrder,
      },
    })

    return NextResponse.json(task, { status: 201 })
  } catch (error) {
    console.error('Failed to create task:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
