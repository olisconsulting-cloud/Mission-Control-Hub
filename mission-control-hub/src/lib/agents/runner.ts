import { createOpenAI } from '@ai-sdk/openai'
import { createAnthropic } from '@ai-sdk/anthropic'
import { streamText, generateText } from 'ai'
import { validateWebhookUrl } from '@/lib/url-validator'

interface AgentConfig {
  provider: 'openai' | 'anthropic' | 'webhook'
  model: string
  apiKey: string
  config: {
    temperature?: number
    maxTokens?: number
    systemPrompt?: string
    webhookUrl?: string
  }
}

interface RunOptions {
  messages: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>
  context?: Record<string, unknown>
  stream?: boolean
}

function getModel(agent: AgentConfig) {
  switch (agent.provider) {
    case 'openai': {
      const openai = createOpenAI({ apiKey: agent.apiKey })
      return openai(agent.model || 'gpt-4o')
    }
    case 'anthropic': {
      const anthropic = createAnthropic({ apiKey: agent.apiKey })
      return anthropic(agent.model || 'claude-sonnet-4-20250514')
    }
    default:
      throw new Error(`Unsupported provider: ${agent.provider}`)
  }
}

export async function runAgent(agent: AgentConfig, options: RunOptions) {
  if (agent.provider === 'webhook') {
    return runWebhookAgent(agent, options)
  }

  const model = getModel(agent)
  const messages = agent.config.systemPrompt
    ? [{ role: 'system' as const, content: agent.config.systemPrompt }, ...options.messages]
    : options.messages

  if (options.stream) {
    return streamText({
      model,
      messages,
      temperature: agent.config.temperature ?? 0.7,
      maxOutputTokens: agent.config.maxTokens ?? 4096,
    })
  }

  const result = await generateText({
    model,
    messages,
    temperature: agent.config.temperature ?? 0.7,
    maxOutputTokens: agent.config.maxTokens ?? 4096,
  })

  return {
    text: result.text,
    usage: result.usage,
  }
}

async function runWebhookAgent(agent: AgentConfig, options: RunOptions) {
  const url = agent.config.webhookUrl
  if (!url) throw new Error('Webhook URL not configured')

  // SSRF Protection: Validate webhook URL before making request
  const validation = validateWebhookUrl(url)
  if (!validation.valid) {
    throw new Error(`Invalid webhook URL: ${validation.reason}`)
  }

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
      messages: options.messages,
      context: options.context,
    }),
  })

  if (!res.ok) {
    throw new Error(`Webhook returned ${res.status}`)
  }

  const data = await res.json()
  return {
    text: data.text || data.content || data.message || '',
    usage: data.usage || { promptTokens: 0, completionTokens: 0 },
  }
}
