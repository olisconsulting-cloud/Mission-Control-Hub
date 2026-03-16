import type { CollectionConfig } from 'payload'

export const Users: CollectionConfig = {
  slug: 'users',
  auth: true,
  admin: {
    useAsTitle: 'name',
  },
  fields: [
    { name: 'name', type: 'text', required: true },
    { name: 'role', type: 'select', options: ['admin', 'user'], defaultValue: 'user' },
    { name: 'nextAuthId', type: 'text', unique: true, admin: { readOnly: true } },
    { name: 'avatarUrl', type: 'text' },
  ],
}
