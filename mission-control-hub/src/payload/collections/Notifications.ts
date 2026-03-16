import type { CollectionConfig } from 'payload'

export const Notifications: CollectionConfig = {
  slug: 'notifications',
  fields: [
    { name: 'title', type: 'text', required: true },
    { name: 'message', type: 'text', required: true },
    {
      name: 'type',
      type: 'select',
      options: ['info', 'success', 'warning', 'error'],
      defaultValue: 'info',
    },
    { name: 'user', type: 'relationship', relationTo: 'users', required: true, index: true },
    { name: 'read', type: 'checkbox', defaultValue: false },
    { name: 'link', type: 'text' },
  ],
}
