import type { CollectionConfig } from 'payload'
import type { CollectionBeforeChangeHook, CollectionAfterChangeHook } from 'payload'

// Hook to auto-set createdBy and handle completedAt
const autoSetMetadata: CollectionBeforeChangeHook = async ({ data, req, operation }) => {
  if (operation === 'create' && req.user) {
    data.createdBy = req.user.id
  }

  // Auto-set completedAt when status changes to 'done'
  if (data.status === 'done' && !data.completedAt) {
    data.completedAt = new Date().toISOString()
  } else if (data.status !== 'done') {
    data.completedAt = null
  }

  // Circular dependency check: prevent a task from depending on itself
  if (data.dependencies && Array.isArray(data.dependencies)) {
    const taskId = data.id
    if (taskId && data.dependencies.some((dep: any) => dep === taskId || dep?.id === taskId)) {
      throw new Error('A task cannot depend on itself')
    }
  }

  return data
}

// Hook to log activity on status/assignee changes
const logTaskActivity: CollectionAfterChangeHook = async ({ doc, previousDoc, operation, req }) => {
  if (operation === 'update' && previousDoc) {
    const changes: string[] = []

    if (doc.status !== previousDoc.status) {
      changes.push(`status changed from ${previousDoc.status} to ${doc.status}`)
    }

    if (doc.assignee !== previousDoc.assignee) {
      const oldAssignee = previousDoc.assignee ? `user ${previousDoc.assignee}` : 'unassigned'
      const newAssignee = doc.assignee ? `user ${doc.assignee}` : 'unassigned'
      changes.push(`assignee changed from ${oldAssignee} to ${newAssignee}`)
    }

    if (changes.length > 0) {
      await req.payload.create({
        collection: 'activities',
        data: {
          user: req.user?.id,
          action: 'task.updated',
          details: { taskId: doc.id, taskTitle: doc.title, changes },
          relatedTask: doc.id,
          space: doc.space,
        },
      })
    }
  } else if (operation === 'create') {
    await req.payload.create({
      collection: 'activities',
      data: {
        user: req.user?.id,
        action: 'task.created',
        details: { taskId: doc.id, taskTitle: doc.title },
        relatedTask: doc.id,
        space: doc.space,
      },
    })
  }

  return doc
}

export const Tasks: CollectionConfig = {
  slug: 'tasks',
  admin: {
    useAsTitle: 'title',
  },
  access: {
    // Creator, assignee, or space members can read
    read: async ({ req: { user, payload } }) => {
      if (!user) return false
      if (user.role === 'admin') return true

      // Get all spaces where user is owner or member
      const spaces = await payload.find({
        collection: 'spaces',
        where: {
          or: [
            { owner: { equals: user.id } },
            { 'members.user': { equals: user.id } },
          ],
        },
        limit: 1000,
      })

      const spaceIds = spaces.docs.map((s) => s.id)

      return {
        or: [
          { createdBy: { equals: user.id } },
          { assignee: { equals: user.id } },
          { space: { in: spaceIds } },
        ],
      }
    },
    // Space members can create tasks
    create: ({ req: { user } }) => !!user,
    // Creator or space owner can update
    update: async ({ req: { user, payload }, id }) => {
      if (!user) return false
      if (user.role === 'admin') return true

      const task = await payload.findByID({ collection: 'tasks', id: id as string })
      if (!task) return false

      const space = await payload.findByID({ collection: 'spaces', id: task.space as string })
      return task.createdBy === user.id || space.owner === user.id
    },
    // Only creator can delete
    delete: async ({ req: { user, payload }, id }) => {
      if (!user) return false
      if (user.role === 'admin') return true

      const task = await payload.findByID({ collection: 'tasks', id: id as string })
      return task?.createdBy === user.id
    },
  },
  fields: [
    { 
      name: 'title', 
      type: 'text', 
      required: true,
      index: true,
    },
    { 
      name: 'description', 
      type: 'richText',
    },
    {
      name: 'status',
      type: 'select',
      options: [
        { label: 'Backlog', value: 'backlog' },
        { label: 'Todo', value: 'todo' },
        { label: 'In Progress', value: 'in-progress' },
        { label: 'Review', value: 'review' },
        { label: 'Done', value: 'done' },
      ],
      defaultValue: 'backlog',
      required: true,
      index: true,
    },
    {
      name: 'priority',
      type: 'select',
      options: [
        { label: 'Low', value: 'low' },
        { label: 'Medium', value: 'medium' },
        { label: 'High', value: 'high' },
        { label: 'Critical', value: 'critical' },
      ],
      defaultValue: 'medium',
      index: true,
    },
    {
      name: 'space',
      type: 'relationship',
      relationTo: 'spaces',
      required: true,
      index: true,
    },
    {
      name: 'assignee',
      type: 'relationship',
      relationTo: 'users',
      index: true,
    },
    {
      name: 'createdBy',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      index: true,
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'labels',
      type: 'array',
      fields: [
        { name: 'name', type: 'text', required: true },
        { name: 'color', type: 'text', defaultValue: '#22c55e' },
      ],
    },
    { 
      name: 'dueDate', 
      type: 'date',
      index: true,
    },
    {
      name: 'completedAt',
      type: 'date',
      admin: {
        readOnly: true,
      },
    },
    { 
      name: 'order', 
      type: 'number', 
      defaultValue: 0, 
      index: true,
    },
    {
      name: 'dependencies',
      type: 'relationship',
      relationTo: 'tasks',
      hasMany: true,
      admin: {
        description: 'Tasks that must be completed before this task',
      },
    },
  ],
  hooks: {
    beforeChange: [autoSetMetadata],
    afterChange: [logTaskActivity],
  },
}
