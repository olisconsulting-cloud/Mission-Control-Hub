import { NextResponse, NextRequest } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { requireAuth, handleAuthError } from '@/lib/authorization'
import { validateQuery, paginatedResponse, handleApiError } from '@/lib/validation'

export async function GET(request: NextRequest) {
  try {
    const session = await requireAuth()
    const pagination = validateQuery(request)
    const unreadOnly = request.nextUrl.searchParams.get('unread') === 'true'

    const payload = await getPayload({ config })
    
    // User-scoped: only fetch notifications for current user
    const where: any = { user: { equals: session.user.id } }
    
    if (unreadOnly) {
      where.read = { equals: false }
    }

    const result = await payload.find({
      collection: 'notifications',
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
