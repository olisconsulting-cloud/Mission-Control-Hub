import { getPayload } from 'payload'
import config from '@/payload/payload.config'

export const agentService = {
  async findBySpace(spaceId: string) {
    const payload = await getPayload({ config })
    return payload.find({
      collection: 'agents',
      where: { space: { equals: spaceId } },
      sort: '-createdAt',
    })
  },

  async findById(agentId: string) {
    const payload = await getPayload({ config })
    return payload.findByID({ collection: 'agents', id: agentId })
  },

  async findByOwner(userId: string) {
    const payload = await getPayload({ config })
    return payload.find({
      collection: 'agents',
      where: { owner: { equals: userId } },
      sort: '-createdAt',
    })
  },

  async findActive(spaceId?: string) {
    const payload = await getPayload({ config })
    
    const where: any = { active: { equals: true } }
    if (spaceId) {
      where.space = { equals: spaceId }
    }

    return payload.find({
      collection: 'agents',
      where,
      sort: '-createdAt',
    })
  },

  async create(data: Record<string, unknown>, userId: string) {
    const payload = await getPayload({ config })
    return payload.create({
      collection: 'agents',
      data: { ...data, owner: userId },
    })
  },

  async update(agentId: string, data: Record<string, unknown>) {
    const payload = await getPayload({ config })
    return payload.update({ collection: 'agents', id: agentId, data })
  },

  async delete(agentId: string) {
    const payload = await getPayload({ config })
    return payload.delete({ collection: 'agents', id: agentId })
  },

  async toggleActive(agentId: string, active: boolean) {
    const payload = await getPayload({ config })
    return payload.update({
      collection: 'agents',
      id: agentId,
      data: { active },
    })
  },

  async trackUsage(agentId: string, usageData: {
    model: string
    inputTokens: number
    outputTokens: number
    cost: number
    duration?: number
    status?: 'success' | 'error' | 'timeout'
    error?: string
    metadata?: Record<string, unknown>
  }) {
    const payload = await getPayload({ config })
    
    return payload.create({
      collection: 'agent-usage',
      data: {
        agent: agentId,
        model: usageData.model,
        tokens: {
          input: usageData.inputTokens,
          output: usageData.outputTokens,
          total: usageData.inputTokens + usageData.outputTokens,
        },
        cost: usageData.cost,
        duration: usageData.duration,
        status: usageData.status || 'success',
        error: usageData.error,
        metadata: usageData.metadata,
      },
    })
  },

  async getUsageStats(agentId: string, period?: 'daily' | 'weekly' | 'monthly') {
    const payload = await getPayload({ config })
    
    let startDate: Date
    const now = new Date()

    switch (period) {
      case 'daily':
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000)
        break
      case 'weekly':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        break
      case 'monthly':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        break
      default:
        startDate = new Date(0) // All time
    }

    const usage = await payload.find({
      collection: 'agent-usage',
      where: {
        and: [
          { agent: { equals: agentId } },
          { createdAt: { greater_than_equal: startDate.toISOString() } },
        ],
      },
      limit: 10000,
    })

    let totalCost = 0
    let totalTokens = 0
    let totalRequests = usage.totalDocs
    let successfulRequests = 0
    let failedRequests = 0

    usage.docs.forEach((u) => {
      totalCost += u.cost
      totalTokens += u.tokens.total
      if (u.status === 'success') successfulRequests++
      if (u.status === 'error') failedRequests++
    })

    return {
      totalCost,
      totalTokens,
      totalRequests,
      successfulRequests,
      failedRequests,
      averageCostPerRequest: totalRequests > 0 ? totalCost / totalRequests : 0,
      successRate: totalRequests > 0 ? (successfulRequests / totalRequests) * 100 : 0,
    }
  },

  async checkBudget(agentId: string): Promise<{ allowed: boolean; reason?: string }> {
    const payload = await getPayload({ config })
    
    // Get agent
    const agent = await payload.findByID({ collection: 'agents', id: agentId })
    if (!agent.active) {
      return { allowed: false, reason: 'Agent is inactive' }
    }

    // Get space budget
    const budgets = await payload.find({
      collection: 'budgets',
      where: { space: { equals: agent.space } },
      limit: 1,
    })

    if (budgets.totalDocs === 0) {
      return { allowed: true } // No budget set
    }

    const budget = budgets.docs[0]
    const usagePercentage = (budget.currentUsage / budget.amount) * 100

    if (usagePercentage >= budget.hardLimit) {
      return { 
        allowed: false, 
        reason: `Budget hard limit reached (${budget.hardLimit}%)` 
      }
    }

    return { allowed: true }
  },
}
