import { NextResponse, NextRequest } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { requireAuth, requireSpaceAccess, handleAuthError } from '@/lib/authorization'
import { validateBody, handleApiError } from '@/lib/validation'
import { updateTaskSchema } from '@/lib/validation/schemas'

interface RouteParams {
  params: Promise<{ taskId: string }>
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await requireAuth()
    const { taskId } = await params
    const payload = await getPayload({ config })

    const task = await payload.findByID({
      collection: 'tasks',
      id: taskId,
    })

    if (!task) {
      return NextResponse.json({ error: { code: 'NOT_FOUND', message: 'Task not found' } }, { status: 404 })
    }

    // Check space access
    const spaceId = typeof task.space === 'string' ? task.space : task.space?.id
    await requireSpaceAccess(session.user.id, spaceId)

    return NextResponse.json(task)
  } catch (error) {
    if (error instanceof Error && error.name === 'AuthError') {
      return handleAuthError(error)
    }
    return handleApiError(error)
  }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await requireAuth()
    const { taskId } = await params
    const body = await validateBody(updateTaskSchema, request)
    const payload = await getPayload({ config })

    // Fetch existing task to check space access
    const existingTask = await payload.findByID({
      collection: 'tasks',
      id: taskId,
    })

    if (!existingTask) {
      return NextResponse.json({ error: { code: 'NOT_FOUND', message: 'Task not found' } }, { status: 404 })
    }

    const spaceId = typeof existingTask.space === 'string' ? existingTask.space : existingTask.space?.id
    await requireSpaceAccess(session.user.id, spaceId)

    const task = await payload.update({
      collection: 'tasks',
      id: taskId,
      data: {
        ...body,
        updatedBy: session.user.id,
      },
    })

    return NextResponse.json(task)
  } catch (error) {
    if (error instanceof Error && error.name === 'AuthError') {
      return handleAuthError(error)
    }
    return handleApiError(error)
  }
}

export async function DELETE(_request: Request, { params }: RouteParams) {
  try {
    const session = await requireAuth()
    const { taskId } = await params
    const payload = await getPayload({ config })

    // Fetch existing task to check space access
    const existingTask = await payload.findByID({
      collection: 'tasks',
      id: taskId,
    })

    if (!existingTask) {
      return NextResponse.json({ error: { code: 'NOT_FOUND', message: 'Task not found' } }, { status: 404 })
    }

    const spaceId = typeof existingTask.space === 'string' ? existingTask.space : existingTask.space?.id
    await requireSpaceAccess(session.user.id, spaceId)

    await payload.delete({
      collection: 'tasks',
      id: taskId,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    if (error instanceof Error && error.name === 'AuthError') {
      return handleAuthError(error)
    }
    return handleApiError(error)
  }
}
