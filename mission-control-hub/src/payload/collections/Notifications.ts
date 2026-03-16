import type { CollectionConfig } from 'payload'

export const Notifications: CollectionConfig = {
  slug: 'notifications',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'recipient', 'type', 'read', 'createdAt'],
  },
  access: {
    // Only recipient can read
    read: ({ req: { user } }) => {
      if (!user) return false
      if (user.role === 'admin') return true
      return { recipient: { equals: user.id } }
    },
    // System can create
    create: () => true,
    // Only recipient can update (mark as read)
    update: ({ req: { user } }) => {
      if (!user) return false
      if (user.role === 'admin') return true
      return { recipient: { equals: user.id } }
    },
    // Only recipient can delete
    delete: ({ req: { user } }) => {
      if (!user) return false
      if (user.role === 'admin') return true
      return { recipient: { equals: user.id } }
    },
  },
  fields: [
    {
      name: 'recipient',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      index: true,
    },
    {
      name: 'type',
      type: 'select',
      options: [
        { label: 'Task Assigned', value: 'task.assigned' },
        { label: 'Task Completed', value: 'task.completed' },
        { label: 'Mention', value: 'mention' },
        { label: 'Space Invite', value: 'space.invite' },
        { label: 'Agent Alert', value: 'agent.alert' },
        { label: 'Budget Warning', value: 'budget.warning' },
        { label: 'System', value: 'system' },
      ],
      required: true,
      index: true,
    },
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'message',
      type: 'textarea',
      required: true,
    },
    {
      name: 'read',
      type: 'checkbox',
      defaultValue: false,
      index: true,
    },
    {
      name: 'readAt',
      type: 'date',
    },
    {
      name: 'relatedTask',
      type: 'relationship',
      relationTo: 'tasks',
    },
    {
      name: 'relatedSpace',
      type: 'relationship',
      relationTo: 'spaces',
    },
    {
      name: 'relatedAgent',
      type: 'relationship',
      relationTo: 'agents',
    },
    {
      name: 'actionUrl',
      type: 'text',
      admin: {
        description: 'URL to navigate to when notification is clicked',
      },
    },
  ],
  timestamps: true,
}
