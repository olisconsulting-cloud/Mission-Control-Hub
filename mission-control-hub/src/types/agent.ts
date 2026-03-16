import type { User } from './user'
import type { Space } from './space'

export interface Agent {
  id: string
  name: string
  description?: string
  type: 'chat' | 'task' | 'webhook'
  provider: 'openai' | 'anthropic' | 'webhook'
  model: string
  apiKey?: string
  config: AgentConfig
  space: string | Space
  owner: string | User
  active: boolean
  icon: string
  createdAt: string
  updatedAt: string
}

export interface AgentConfig {
  temperature: number
  maxTokens: number
  systemPrompt?: string
  webhookUrl?: string
}

export interface AgentUsage {
  id: string
  agent: string | Agent
  model: string
  tokens: {
    input: number
    output: number
    total: number
  }
  cost: number
  duration?: number
  status: 'success' | 'error' | 'timeout'
  error?: string
  metadata?: Record<string, unknown>
  createdAt: string
  updatedAt: string
}

export interface AgentUsageStats {
  totalCost: number
  totalTokens: number
  totalRequests: number
  successfulRequests: number
  failedRequests: number
  averageCostPerRequest: number
  successRate: number
}

export interface BudgetCheck {
  allowed: boolean
  reason?: string
}
