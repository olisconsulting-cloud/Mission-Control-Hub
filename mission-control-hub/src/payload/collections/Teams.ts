import type { CollectionConfig } from 'payload'
import type { CollectionAfterChangeHook } from 'payload'

// Hook to log team activity
const logTeamActivity: CollectionAfterChangeHook = async ({ doc, operation, req, previousDoc }) => {
  const action = operation === 'create' ? 'team.created' : 'team.updated'
  const details: any = { teamId: doc.id, teamName: doc.name }

  if (operation === 'update' && previousDoc) {
    const changes: string[] = []
    if (doc.name !== previousDoc.name) {
      changes.push(`name changed from "${previousDoc.name}" to "${doc.name}"`)
    }
    if (JSON.stringify(doc.members) !== JSON.stringify(previousDoc.members)) {
      changes.push('members updated')
    }
    details.changes = changes
  }

  await req.payload.create({
    collection: 'activities',
    data: {
      user: req.user?.id,
      action,
      details,
    },
  })

  return doc
}

export const Teams: CollectionConfig = {
  slug: 'teams',
  admin: {
    useAsTitle: 'name',
  },
  access: {
    // Members can read
    read: ({ req: { user } }) => {
      if (!user) return false
      if (user.role === 'admin') return true

      return {
        or: [
          { owner: { equals: user.id } },
          { 'members.user': { equals: user.id } },
        ],
      }
    },
    // Authenticated users can create teams
    create: ({ req: { user } }) => !!user,
    // Only owner can update
    update: ({ req: { user } }) => {
      if (!user) return false
      if (user.role === 'admin') return true
      return { owner: { equals: user.id } }
    },
    // Only owner can delete
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
      name: 'owner',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      index: true,
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
  ],
  hooks: {
    afterChange: [logTeamActivity],
  },
}
