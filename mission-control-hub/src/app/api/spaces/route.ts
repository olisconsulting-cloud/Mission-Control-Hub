import { NextResponse, NextRequest } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { requireAuth, handleAuthError } from '@/lib/authorization'
import { validateBody, validateQuery, paginatedResponse, handleApiError } from '@/lib/validation'
import { createSpaceSchema } from '@/lib/validation/schemas'

export async function GET(request: NextRequest) {
  try {
    const session = await requireAuth()
    const pagination = validateQuery(request)

    const payload = await getPayload({ config })
    const result = await payload.find({
      collection: 'spaces',
      where: {
        or: [
          { owner: { equals: session.user.id } },
          { 'members.user': { equals: session.user.id } },
        ],
      },
      sort: pagination.sort || '-createdAt',
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
    const body = await validateBody(createSpaceSchema, request)

    const payload = await getPayload({ config })

    const space = await payload.create({
      collection: 'spaces',
      data: {
        name: body.name,
        type: body.type,
        description: body.description || '',
        owner: session.user.id,
        team: body.team,
        icon: '🚀',
        color: '#22c55e',
      },
    })

    return NextResponse.json(space, { status: 201 })
  } catch (error) {
    if (error instanceof Error && error.name === 'AuthError') {
      return handleAuthError(error)
    }
    return handleApiError(error)
  }
}
