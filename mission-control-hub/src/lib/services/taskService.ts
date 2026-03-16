import { getPayload } from 'payload'
import config from '@/payload/payload.config'

export const taskService = {
  async findBySpace(spaceId: string, page = 1, limit = 50) {
    const payload = await getPayload({ config })
    return payload.find({
      collection: 'tasks',
      where: { space: { equals: spaceId } },
      sort: '-createdAt',
      page,
      limit,
    })
  },

  async findById(taskId: string) {
    const payload = await getPayload({ config })
    return payload.findByID({ collection: 'tasks', id: taskId })
  },

  async findByStatus(spaceId: string, status: string) {
    const payload = await getPayload({ config })
    return payload.find({
      collection: 'tasks',
      where: {
        and: [
          { space: { equals: spaceId } },
          { status: { equals: status } },
        ],
      },
      sort: 'order',
    })
  },

  async findByAssignee(userId: string, page = 1, limit = 50) {
    const payload = await getPayload({ config })
    return payload.find({
      collection: 'tasks',
      where: { assignee: { equals: userId } },
      sort: '-createdAt',
      page,
      limit,
    })
  },

  async findOverdue(spaceId?: string) {
    const payload = await getPayload({ config })
    const now = new Date().toISOString()

    const where: any = {
      and: [
        { dueDate: { less_than: now } },
        { status: { not_equals: 'done' } },
      ],
    }

    if (spaceId) {
      where.and.push({ space: { equals: spaceId } })
    }

    return payload.find({
      collection: 'tasks',
      where,
      sort: 'dueDate',
    })
  },

  async create(data: Record<string, unknown>, userId: string) {
    const payload = await getPayload({ config })
    return payload.create({
      collection: 'tasks',
      data: { ...data, createdBy: userId },
    })
  },

  async update(taskId: string, data: Record<string, unknown>) {
    const payload = await getPayload({ config })
    return payload.update({ collection: 'tasks', id: taskId, data })
  },

  async delete(taskId: string) {
    const payload = await getPayload({ config })
    return payload.delete({ collection: 'tasks', id: taskId })
  },

  async getStats(spaceId: string) {
    const payload = await getPayload({ config })
    const tasks = await payload.find({
      collection: 'tasks',
      where: { space: { equals: spaceId } },
      limit: 0, // Only get count
    })

    // Fetch actual tasks to calculate stats
    const allTasks = await payload.find({
      collection: 'tasks',
      where: { space: { equals: spaceId } },
      limit: 1000,
    })

    const byStatus: Record<string, number> = {}
    const byPriority: Record<string, number> = {}
    let completedThisWeek = 0
    let overdue = 0

    const now = new Date()
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

    allTasks.docs.forEach((task) => {
      // By status
      byStatus[task.status] = (byStatus[task.status] || 0) + 1

      // By priority
      byPriority[task.priority] = (byPriority[task.priority] || 0) + 1

      // Completed this week
      if (task.status === 'done' && task.completedAt) {
        const completedDate = new Date(task.completedAt)
        if (completedDate >= weekAgo) {
          completedThisWeek++
        }
      }

      // Overdue
      if (task.dueDate && task.status !== 'done') {
        const dueDate = new Date(task.dueDate)
        if (dueDate < now) {
          overdue++
        }
      }
    })

    return {
      total: tasks.totalDocs,
      byStatus,
      byPriority,
      completedThisWeek,
      overdue,
    }
  },

  async reorder(taskId: string, newOrder: number, newStatus?: string) {
    const payload = await getPayload({ config })
    const updateData: any = { order: newOrder }
    
    if (newStatus) {
      updateData.status = newStatus
    }

    return payload.update({
      collection: 'tasks',
      id: taskId,
      data: updateData,
    })
  },
}
