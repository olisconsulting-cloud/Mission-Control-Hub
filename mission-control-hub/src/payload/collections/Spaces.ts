import type { CollectionConfig } from 'payload'
import type { CollectionAfterChangeHook, CollectionBeforeDeleteHook } from 'payload'

// Hook to log space activity
const logSpaceActivity: CollectionAfterChangeHook = async ({ doc, operation, req, previousDoc }) => {
  const action = operation === 'create' ? 'space.created' : 'space.updated'
  const details: any = { spaceId: doc.id, spaceName: doc.name }

  if (operation === 'update' && previousDoc) {
    const changes: string[] = []
    if (doc.name !== previousDoc.name) {
      changes.push(`name changed from "${previousDoc.name}" to "${doc.name}"`)
    }
    if (doc.type !== previousDoc.type) {
      changes.push(`type changed from ${previousDoc.type} to ${doc.type}`)
    }
    details.changes = changes
  }

  await req.payload.create({
    collection: 'activities',
    data: {
      user: req.user?.id,
      action,
      details,
      space: doc.id,
    },
  })

  return doc
}

// Hook to prevent deletion of personal spaces
const preventPersonalSpaceDeletion: CollectionBeforeDeleteHook = async ({ req, id }) => {
  const space = await req.payload.findByID({ collection: 'spaces', id })
  if (space.type === 'personal') {
    throw new Error('Personal spaces cannot be deleted')
  }
  return
}

export const Spaces: CollectionConfig = {
  slug: 'spaces',
  admin: {
    useAsTitle: 'name',
  },
  access: {
    // Owner and members can read
    read: async ({ req: { user } }) => {
      if (!user) return false
      if (user.role === 'admin') return true

      return {
        or: [
          { owner: { equals: user.id } },
          { 'members.user': { equals: user.id } },
        ],
      }
    },
    // Authenticated users can create spaces
    create: ({ req: { user } }) => !!user,
    // Only owner can update
    update: ({ req: { user } }) => {
      if (!user) return false
      if (user.role === 'admin') return true
      return { owner: { equals: user.id } }
    },
    // Only owner can delete (and not personal spaces - see hook)
    delete: ({ req: { user } }) => {
      if (!user) return false
      if (user.role === 'admin') return true
      return { owner: { equals: user.id } }
    },
  },
  fields: [
    { 
      name: 'name', 
      type: 'text', 
      required: true,
      index: true,
    },
    { 
      name: 'description', 
      type: 'textarea',
    },
    {
      name: 'type',
      type: 'select',
      options: ['personal', 'team', 'project', 'client'],
      required: true,
      defaultValue: 'personal',
      index: true,
    },
    {
      name: 'owner',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      index: true,
    },
    {
      name: 'team',
      type: 'relationship',
      relationTo: 'teams',
      index: true,
      admin: {
        condition: (_, siblingData) => siblingData?.type === 'team',
      },
    },
    {
      name: 'members',
      type: 'array',
      fields: [
        { 
          name: 'user', 
          type: 'relationship', 
          relationTo: 'users', 
          required: true,
        },
        { 
          name: 'role', 
          type: 'select', 
          options: ['owner', 'admin', 'member', 'viewer'], 
          defaultValue: 'member',
          required: true,
        },
        {
          name: 'joinedAt',
          type: 'date',
          defaultValue: () => new Date().toISOString(),
          admin: {
            readOnly: true,
          },
        },
      ],
    },
    {
      name: 'settings',
      type: 'group',
      fields: [
        { 
          name: 'defaultTaskStatus', 
          type: 'text', 
          defaultValue: 'backlog',
        },
        { 
          name: 'notifications', 
          type: 'checkbox', 
          defaultValue: true,
        },
        { 
          name: 'isPublic', 
          type: 'checkbox', 
          defaultValue: false,
        },
      ],
    },
    { 
      name: 'color', 
      type: 'text', 
      defaultValue: '#22c55e',
    },
    { 
      name: 'icon', 
      type: 'text', 
      defaultValue: '🚀',
    },
  ],
  hooks: {
    afterChange: [logSpaceActivity],
    beforeDelete: [preventPersonalSpaceDeletion],
  },
}
