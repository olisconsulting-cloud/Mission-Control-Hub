import type { CollectionConfig } from 'payload'

export const Spaces: CollectionConfig = {
  slug: 'spaces',
  admin: {
    useAsTitle: 'name',
  },
  fields: [
    { name: 'name', type: 'text', required: true },
    { name: 'description', type: 'textarea' },
    {
      name: 'type',
      type: 'select',
      options: ['personal', 'team'],
      required: true,
      defaultValue: 'personal',
    },
    {
      name: 'owner',
      type: 'relationship',
      relationTo: 'users',
      required: true,
    },
    {
      name: 'team',
      type: 'relationship',
      relationTo: 'teams',
      admin: {
        condition: (_, siblingData) => siblingData?.type === 'team',
      },
    },
    { name: 'color', type: 'text', defaultValue: '#22c55e' },
    { name: 'icon', type: 'text', defaultValue: '🚀' },
  ],
}
