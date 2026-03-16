import type { CollectionConfig } from 'payload'

export const AgentUsage: CollectionConfig = {
  slug: 'agent-usage',
  admin: {
    useAsTitle: 'id',
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
      name: 'user',
      type: 'relationship',
      relationTo: 'users',
      required: true,
    },
    { name: 'inputTokens', type: 'number', required: true },
    { name: 'outputTokens', type: 'number', required: true },
    { name: 'cost', type: 'number' },
    { name: 'model', type: 'text' },
    { name: 'durationMs', type: 'number' },
    { name: 'success', type: 'checkbox', defaultValue: true },
  ],
}
