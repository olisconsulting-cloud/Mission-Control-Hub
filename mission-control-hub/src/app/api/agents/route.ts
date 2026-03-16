import { NextResponse, NextRequest } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { requireAuth, requireSpaceAccess, handleAuthError } from '@/lib/authorization'
import { validateBody, validateQuery, paginatedResponse, handleApiError } from '@/lib/validation'
import { createAgentSchema } from '@/lib/validation/schemas'
import { validateWebhookUrl } from '@/lib/url-validator'

export async function GET(request: NextRequest) {
  try {
    const session = await requireAuth()
    const pagination = validateQuery(request)

    const payload = await getPayload({ config })
    const result = await payload.find({
      collection: 'agents',
      where: { owner: { equals: session.user.id } },
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
    const body = await validateBody(createAgentSchema, request)

    // Check space access
    await requireSpaceAccess(session.user.id, body.spaceId)

    // Validate webhook URL if provided
    if (body.webhookUrl) {
      const validation = validateWebhookUrl(body.webhookUrl)
      if (!validation.valid) {
        return NextResponse.json(
          { error: { code: 'VALIDATION_ERROR', message: `Invalid webhook URL: ${validation.reason}` } },
          { status: 400 }
        )
      }
    }

    const payload = await getPayload({ config })

    const agent = await payload.create({
      collection: 'agents',
      data: {
        name: body.name,
        type: body.type,
        model: body.model,
        webhookUrl: body.webhookUrl,
        apiKey: body.apiKey,
        systemPrompt: body.systemPrompt,
        space: body.spaceId,
        owner: session.user.id,
      },
    })

    return NextResponse.json(agent, { status: 201 })
  } catch (error) {
    if (error instanceof Error && error.name === 'AuthError') {
      return handleAuthError(error)
    }
    return handleApiError(error)
  }
}
