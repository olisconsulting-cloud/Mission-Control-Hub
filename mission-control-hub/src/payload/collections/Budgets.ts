import type { CollectionConfig } from 'payload'

export const Budgets: CollectionConfig = {
  slug: 'budgets',
  admin: {
    useAsTitle: 'name',
  },
  fields: [
    { name: 'name', type: 'text', required: true },
    { name: 'space', type: 'relationship', relationTo: 'spaces', required: true, index: true },
    { name: 'softLimit', type: 'number', required: true, admin: { description: 'Soft limit in USD (warning)' } },
    { name: 'hardLimit', type: 'number', required: true, admin: { description: 'Hard limit in USD (block)' } },
    {
      name: 'period',
      type: 'select',
      options: ['daily', 'weekly', 'monthly'],
      defaultValue: 'monthly',
      required: true,
    },
    { name: 'currentSpend', type: 'number', defaultValue: 0 },
    { name: 'periodStart', type: 'date' },
  ],
}
