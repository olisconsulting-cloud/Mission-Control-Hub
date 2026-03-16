import { NextResponse, type NextRequest } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { requireAuth, handleAuthError } from '@/lib/authorization'
import { handleApiError } from '@/lib/validation'

export async function GET(request: NextRequest) {
  try {
    const session = await requireAuth()

    const days = parseInt(request.nextUrl.searchParams.get('days') || '30')
    const since = new Date()
    since.setDate(since.getDate() - days)

    const payload = await getPayload({ config })

    // User-scoped: only fetch usage for current user
    const usage = await payload.find({
      collection: 'agent-usage',
      where: {
        user: { equals: session.user.id },
        createdAt: { greater_than: since.toISOString() },
      },
      sort: '-createdAt',
      limit: 1000,
    })

    // Aggregate by day
    const dailyMap = new Map<string, { tokens: number; cost: number; calls: number }>()

    for (const doc of usage.docs) {
      const day = new Date(doc.createdAt).toISOString().split('T')[0]
      const existing = dailyMap.get(day) || { tokens: 0, cost: 0, calls: 0 }
      existing.tokens += (doc.inputTokens || 0) + (doc.outputTokens || 0)
      existing.cost += doc.cost || 0
      existing.calls += 1
      dailyMap.set(day, existing)
    }

    // Aggregate by model
    const modelMap = new Map<string, { tokens: number; cost: number; calls: number }>()
    for (const doc of usage.docs) {
      const model = doc.model || 'unknown'
      const existing = modelMap.get(model) || { tokens: 0, cost: 0, calls: 0 }
      existing.tokens += (doc.inputTokens || 0) + (doc.outputTokens || 0)
      existing.cost += doc.cost || 0
      existing.calls += 1
      modelMap.set(model, existing)
    }

    const totalTokens = usage.docs.reduce((sum, d) => sum + (d.inputTokens || 0) + (d.outputTokens || 0), 0)
    const totalCost = usage.docs.reduce((sum, d) => sum + (d.cost || 0), 0)

    return NextResponse.json({
      totalTokens,
      totalCost,
      totalCalls: usage.docs.length,
      daily: Object.fromEntries(dailyMap),
      byModel: Object.fromEntries(modelMap),
    })
  } catch (error) {
    if (error instanceof Error && error.name === 'AuthError') {
      return handleAuthError(error)
    }
    return handleApiError(error)
  }
}
