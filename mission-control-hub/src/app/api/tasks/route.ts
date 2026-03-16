import { NextResponse, type NextRequest } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { requireAuth, requireSpaceAccess, handleAuthError } from '@/lib/authorization'
import { validateBody, validateQuery, paginatedResponse, handleApiError } from '@/lib/validation'
import { createTaskSchema } from '@/lib/validation/schemas'

export async function GET(request: NextRequest) {
  try {
    const session = await requireAuth()
    const pagination = validateQuery(request)

    const spaceId = request.nextUrl.searchParams.get('spaceId')
    if (!spaceId) {
      return NextResponse.json({ error: { code: 'VALIDATION_ERROR', message: 'spaceId required' } }, { status: 400 })
    }

    // Check space access
    await requireSpaceAccess(session.user.id, spaceId)

    const payload = await getPayload({ config })
    
    const result = await payload.find({
      collection: 'tasks',
      where: { space: { equals: spaceId } },
      sort: pagination.sort || 'order',
      limit: pagination.limit,
      page: pagination.page,
    })

    return paginatedResponse(result.docs, result.totalDocs, pagination)
  } catch (error) {
    if (error instanceof Error && error.name === 'AuthError') {
      return handleAuthError(error)
    }
    return handleApiError(error)
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth()
    const body = await validateBody(createTaskSchema, request)

    // Check space access
    await requireSpaceAccess(session.user.id, body.spaceId)

    const payload = await getPayload({ config })

    // Get next order number
    const existing = await payload.find({
      collection: 'tasks',
      where: {
        space: { equals: body.spaceId },
        status: { equals: body.status || 'todo' },
      },
      sort: '-order',
      limit: 1,
    })

    const nextOrder = existing.docs.length > 0 ? (existing.docs[0].order || 0) + 1 : 0

    const task = await payload.create({
      collection: 'tasks',
      data: {
        title: body.title,
        description: body.description,
        status: body.status,
        priority: body.priority,
        space: body.spaceId,
        assignee: body.assignee || undefined,
        dueDate: body.dueDate,
        tags: body.tags,
        estimatedHours: body.estimatedHours,
        order: nextOrder,
        createdBy: session.user.id,
      },
    })

    return NextResponse.json(task, { status: 201 })
  } catch (error) {
    if (error instanceof Error && error.name === 'AuthError') {
      return handleAuthError(error)
    }
    return handleApiError(error)
  }
}
