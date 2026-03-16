import { NextResponse, NextRequest } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { requireAuth, requireOwnership, handleAuthError } from '@/lib/authorization'
import { validateBody, handleApiError } from '@/lib/validation'
import { chatMessageSchema } from '@/lib/validation/schemas'
import { validateWebhookUrl } from '@/lib/url-validator'
import { runAgent } from '@/lib/agents/runner'

interface RouteParams {
  params: Promise<{ agentId: string }>
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await requireAuth()
    const { agentId } = await params
    const body = await validateBody(chatMessageSchema, request)
    const payload = await getPayload({ config })

    // Fetch agent config
    const agent = await payload.findByID({
      collection: 'agents',
      id: agentId,
    })

    if (!agent) {
      return NextResponse.json({ error: { code: 'NOT_FOUND', message: 'Agent not found' } }, { status: 404 })
    }

    if (!agent.active) {
      return NextResponse.json({ error: { code: 'FORBIDDEN', message: 'Agent is inactive' } }, { status: 403 })
    }

    // Check ownership
    const ownerId = typeof agent.owner === 'string' ? agent.owner : agent.owner?.id
    await requireOwnership(session.user.id, ownerId)

    // Validate webhook URL if present (SSRF protection)
    if (agent.config?.webhookUrl) {
      const validation = validateWebhookUrl(agent.config.webhookUrl)
      if (!validation.valid) {
        return NextResponse.json(
          { error: { code: 'VALIDATION_ERROR', message: `Invalid webhook URL: ${validation.reason}` } },
          { status: 400 }
        )
      }
    }

    const startTime = Date.now()

    // Run the agent
    const result = await runAgent(
      {
        provider: agent.provider as 'openai' | 'anthropic' | 'webhook',
        model: agent.model || 'gpt-4o',
        apiKey: agent.apiKey || '',
        config: {
          temperature: agent.config?.temperature ?? 0.7,
          maxTokens: agent.config?.maxTokens ?? 4096,
          systemPrompt: agent.config?.systemPrompt || undefined,
          webhookUrl: agent.config?.webhookUrl || undefined,
        },
      },
      { 
        messages: [{ role: 'user', content: body.message }],
        context: body.context,
      }
    )

    const durationMs = Date.now() - startTime

    // Log usage
    const usage = 'usage' in result ? result.usage : undefined
    if (usage) {
      await payload.create({
        collection: 'agent-usage',
        data: {
          agent: agentId,
          user: session.user.id,
          inputTokens: usage.promptTokens || 0,
          outputTokens: usage.completionTokens || 0,
          model: agent.model || 'unknown',
          durationMs,
          success: true,
        },
      })
    }

    return NextResponse.json({
      text: 'text' in result ? result.text : '',
      usage,
      durationMs,
    })
  } catch (error) {
    if (error instanceof Error && error.name === 'AuthError') {
      return handleAuthError(error)
    }
    console.error('Agent chat failed:', error)
    return handleApiError(error)
  }
}
