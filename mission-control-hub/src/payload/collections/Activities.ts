import type { CollectionConfig } from 'payload'

export const Activities: CollectionConfig = {
  slug: 'activities',
  admin: {
    useAsTitle: 'action',
    defaultColumns: ['action', 'user', 'space', 'createdAt'],
  },
  access: {
    // Space members can read
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
          { user: { equals: user.id } },
          { space: { in: spaceIds } },
        ],
      }
    },
    // System can create
    create: () => true,
    // No manual updates
    update: () => false,
    // No manual deletes (retention policy via cron)
    delete: ({ req: { user } }) => user?.role === 'admin',
  },
  fields: [
    {
      name: 'user',
      type: 'relationship',
      relationTo: 'users',
      index: true,
    },
    {
      name: 'action',
      type: 'text',
      required: true,
      index: true,
      admin: {
        description: 'Action type (e.g., task.created, space.updated)',
      },
    },
    {
      name: 'details',
      type: 'json',
      admin: {
        description: 'Additional details about the action',
      },
    },
    {
      name: 'relatedTask',
      type: 'relationship',
      relationTo: 'tasks',
      index: true,
    },
    {
      name: 'space',
      type: 'relationship',
      relationTo: 'spaces',
      index: true,
    },
    {
      name: 'ipAddress',
      type: 'text',
      admin: {
        description: 'IP address of the user',
      },
    },
    {
      name: 'userAgent',
      type: 'text',
      admin: {
        description: 'User agent string',
      },
    },
  ],
  timestamps: {
    createdAt: true,
    updatedAt: false,
  },
}
