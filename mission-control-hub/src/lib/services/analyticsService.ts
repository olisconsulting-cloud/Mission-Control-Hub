import { getPayload } from 'payload'
import config from '@/payload/payload.config'

export const analyticsService = {
  async getOverview(userId: string) {
    const payload = await getPayload({ config })

    // Get user's spaces
    const spaces = await payload.find({
      collection: 'spaces',
      where: {
        or: [
          { owner: { equals: userId } },
          { 'members.user': { equals: userId } },
        ],
      },
      limit: 1000,
    })

    const spaceIds = spaces.docs.map((s) => s.id)

    // Get tasks
    const tasks = await payload.find({
      collection: 'tasks',
      where: { space: { in: spaceIds } },
      limit: 0,
    })

    // Get agents
    const agents = await payload.find({
      collection: 'agents',
      where: { space: { in: spaceIds } },
      limit: 0,
    })

    // Get activities (last 7 days)
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    const activities = await payload.find({
      collection: 'activities',
      where: {
        and: [
          { space: { in: spaceIds } },
          { createdAt: { greater_than_equal: weekAgo.toISOString() } },
        ],
      },
      limit: 0,
    })

    // Get unread notifications
    const notifications = await payload.find({
      collection: 'notifications',
      where: {
        and: [
          { recipient: { equals: userId } },
          { read: { equals: false } },
        ],
      },
      limit: 0,
    })

    return {
      spaces: spaces.totalDocs,
      tasks: tasks.totalDocs,
      agents: agents.totalDocs,
      activitiesThisWeek: activities.totalDocs,
      unreadNotifications: notifications.totalDocs,
    }
  },

  async getTaskTrends(spaceId: string, days = 30) {
    const payload = await getPayload({ config })
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000)

    const tasks = await payload.find({
      collection: 'tasks',
      where: {
        and: [
          { space: { equals: spaceId } },
          { createdAt: { greater_than_equal: startDate.toISOString() } },
        ],
      },
      limit: 10000,
      sort: 'createdAt',
    })

    // Group by day
    const byDay: Record<string, { created: number; completed: number }> = {}

    tasks.docs.forEach((task) => {
      const createdDay = new Date(task.createdAt).toISOString().split('T')[0]
      
      if (!byDay[createdDay]) {
        byDay[createdDay] = { created: 0, completed: 0 }
      }
      byDay[createdDay].created++

      if (task.completedAt) {
        const completedDay = new Date(task.completedAt).toISOString().split('T')[0]
        if (!byDay[completedDay]) {
          byDay[completedDay] = { created: 0, completed: 0 }
        }
        byDay[completedDay].completed++
      }
    })

    return byDay
  },

  async getAgentUsageTrends(spaceId: string, days = 30) {
    const payload = await getPayload({ config })
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000)

    // Get all agents in space
    const agents = await payload.find({
      collection: 'agents',
      where: { space: { equals: spaceId } },
      limit: 1000,
    })

    const agentIds = agents.docs.map((a) => a.id)

    // Get usage
    const usage = await payload.find({
      collection: 'agent-usage',
      where: {
        and: [
          { agent: { in: agentIds } },
          { createdAt: { greater_than_equal: startDate.toISOString() } },
        ],
      },
      limit: 10000,
      sort: 'createdAt',
    })

    // Group by day
    const byDay: Record<string, { requests: number; cost: number; tokens: number }> = {}

    usage.docs.forEach((u) => {
      const day = new Date(u.createdAt).toISOString().split('T')[0]
      
      if (!byDay[day]) {
        byDay[day] = { requests: 0, cost: 0, tokens: 0 }
      }
      byDay[day].requests++
      byDay[day].cost += u.cost
      byDay[day].tokens += u.tokens.total
    })

    return byDay
  },

  async getActivityTimeline(spaceId: string, limit = 50) {
    const payload = await getPayload({ config })

    return payload.find({
      collection: 'activities',
      where: { space: { equals: spaceId } },
      sort: '-createdAt',
      limit,
    })
  },

  async getUserProductivity(userId: string, days = 30) {
    const payload = await getPayload({ config })
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000)

    // Tasks created
    const tasksCreated = await payload.find({
      collection: 'tasks',
      where: {
        and: [
          { createdBy: { equals: userId } },
          { createdAt: { greater_than_equal: startDate.toISOString() } },
        ],
      },
      limit: 0,
    })

    // Tasks completed
    const tasksCompleted = await payload.find({
      collection: 'tasks',
      where: {
        and: [
          { assignee: { equals: userId } },
          { status: { equals: 'done' } },
          { completedAt: { greater_than_equal: startDate.toISOString() } },
        ],
      },
      limit: 0,
    })

    // Tasks assigned
    const tasksAssigned = await payload.find({
      collection: 'tasks',
      where: { assignee: { equals: userId } },
      limit: 0,
    })

    return {
      tasksCreated: tasksCreated.totalDocs,
      tasksCompleted: tasksCompleted.totalDocs,
      tasksAssigned: tasksAssigned.totalDocs,
      completionRate: tasksAssigned.totalDocs > 0 
        ? (tasksCompleted.totalDocs / tasksAssigned.totalDocs) * 100 
        : 0,
    }
  },

  async getSpaceHealth(spaceId: string) {
    const payload = await getPayload({ config })

    // Get all tasks
    const allTasks = await payload.find({
      collection: 'tasks',
      where: { space: { equals: spaceId } },
      limit: 10000,
    })

    const now = new Date()
    let overdueTasks = 0
    let blockedTasks = 0
    let inProgressTasks = 0
    let completedThisWeek = 0

    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

    allTasks.docs.forEach((task) => {
      // Overdue
      if (task.dueDate && task.status !== 'done') {
        const dueDate = new Date(task.dueDate)
        if (dueDate < now) overdueTasks++
      }

      // Blocked (has uncompleted dependencies)
      if (task.dependencies && task.dependencies.length > 0) {
        blockedTasks++
      }

      // In progress
      if (task.status === 'in-progress') {
        inProgressTasks++
      }

      // Completed this week
      if (task.status === 'done' && task.completedAt) {
        const completedDate = new Date(task.completedAt)
        if (completedDate >= weekAgo) completedThisWeek++
      }
    })

    // Calculate health score (0-100)
    const overdueRatio = allTasks.totalDocs > 0 ? overdueTasks / allTasks.totalDocs : 0
    const blockedRatio = allTasks.totalDocs > 0 ? blockedTasks / allTasks.totalDocs : 0
    const completionVelocity = completedThisWeek / 7 // per day

    const healthScore = Math.max(
      0,
      100 - (overdueRatio * 40) - (blockedRatio * 30) + (completionVelocity * 10)
    )

    return {
      healthScore: Math.round(healthScore),
      overdueTasks,
      blockedTasks,
      inProgressTasks,
      completedThisWeek,
      totalTasks: allTasks.totalDocs,
    }
  },
}
