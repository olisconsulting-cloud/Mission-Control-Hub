import { NextResponse, NextRequest } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { requireAuth, handleAuthError } from '@/lib/authorization'
import { validateQuery, paginatedResponse, handleApiError } from '@/lib/validation'

export async function GET(request: NextRequest) {
  try {
    const session = await requireAuth()
    const pagination = validateQuery(request)
    const spaceId = request.nextUrl.searchParams.get('spaceId')

    const payload = await getPayload({ config })

    // Build where clause - space-scoped or user-scoped
    const where = spaceId 
      ? { space: { equals: spaceId } }
      : undefined // All activities for spaces user has access to

    const result = await payload.find({
      collection: 'activities',
      where,
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
