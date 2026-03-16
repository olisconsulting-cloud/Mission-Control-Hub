import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { auth } from '@/lib/auth'
import { runAgent } from '@/lib/agents/runner'

interface RouteParams {
  params: Promise<{ agentId: string }>
}

export async function POST(request: Request, { params }: RouteParams) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { agentId } = await params
    const body = await request.json()
    const payload = await getPayload({ config })

    // Fetch agent config
    const agent = await payload.findByID({
      collection: 'agents',
      id: agentId,
    })

    if (!agent || !agent.active) {
      return NextResponse.json({ error: 'Agent not found or inactive' }, { status: 404 })
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
      { messages: body.messages || [] }
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
    console.error('Agent chat failed:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Agent error' },
      { status: 500 }
    )
  }
}
