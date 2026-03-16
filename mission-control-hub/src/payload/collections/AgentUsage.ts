import type { CollectionConfig } from 'payload'

export const AgentUsage: CollectionConfig = {
  slug: 'agent-usage',
  admin: {
    useAsTitle: 'id',
    defaultColumns: ['agent', 'model', 'tokens', 'cost', 'createdAt'],
  },
  access: {
    // Related agent owner can read
    read: async ({ req: { user, payload } }) => {
      if (!user) return false
      if (user.role === 'admin') return true

      // Find all agents owned by the user
      const agents = await payload.find({
        collection: 'agents',
        where: { owner: { equals: user.id } },
        limit: 1000,
      })

      const agentIds = agents.docs.map((a) => a.id)

      return { agent: { in: agentIds } }
    },
    // System can create (typically via API)
    create: () => true,
    // No manual updates
    update: () => false,
    // Agent owner can delete usage logs
    delete: async ({ req: { user, payload }, id }) => {
      if (!user) return false
      if (user.role === 'admin') return true

      const usage = await payload.findByID({ collection: 'agent-usage', id: id as string })
      if (!usage) return false

      const agent = await payload.findByID({ collection: 'agents', id: usage.agent as string })
      return agent?.owner === user.id
    },
  },
  fields: [
    {
      name: 'agent',
      type: 'relationship',
      relationTo: 'agents',
      required: true,
      index: true,
    },
    {
      name: 'model',
      type: 'text',
      required: true,
      index: true,
    },
    {
      name: 'tokens',
      type: 'group',
      fields: [
        { name: 'input', type: 'number', required: true },
        { name: 'output', type: 'number', required: true },
        { name: 'total', type: 'number', required: true },
      ],
    },
    {
      name: 'cost',
      type: 'number',
      required: true,
      admin: {
        description: 'Cost in USD',
      },
    },
    {
      name: 'duration',
      type: 'number',
      admin: {
        description: 'Duration in milliseconds',
      },
    },
    {
      name: 'status',
      type: 'select',
      options: [
        { label: 'Success', value: 'success' },
        { label: 'Error', value: 'error' },
        { label: 'Timeout', value: 'timeout' },
      ],
      required: true,
      defaultValue: 'success',
      index: true,
    },
    {
      name: 'error',
      type: 'textarea',
      admin: {
        condition: (_, siblingData) => siblingData?.status === 'error',
      },
    },
    {
      name: 'metadata',
      type: 'json',
      admin: {
        description: 'Additional metadata (request ID, etc.)',
      },
    },
  ],
  timestamps: true,
}
