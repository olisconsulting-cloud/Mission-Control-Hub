import type { CollectionConfig } from 'payload'
import type { CollectionAfterChangeHook } from 'payload'

// Hook to log user activity
const logUserActivity: CollectionAfterChangeHook = async ({ doc, operation, req }) => {
  if (operation === 'create') {
    await req.payload.create({
      collection: 'activities',
      data: {
        user: doc.id,
        action: 'user.created',
        details: { email: doc.email, name: doc.name },
      },
    })
  }
  return doc
}

// Hook to track last login
const trackLastLogin: CollectionAfterChangeHook = async ({ doc, operation, req, previousDoc }) => {
  if (operation === 'update' && req.user && req.user.id === doc.id) {
    // Update lastLoginAt silently (avoid infinite loop)
    if (!previousDoc || new Date(doc.updatedAt).getTime() - new Date(previousDoc.updatedAt).getTime() > 60000) {
      await req.payload.update({
        collection: 'users',
        id: doc.id,
        data: { lastLoginAt: new Date().toISOString() },
      })
    }
  }
  return doc
}

export const Users: CollectionConfig = {
  slug: 'users',
  auth: true,
  admin: {
    useAsTitle: 'name',
  },
  access: {
    // Admins can read all users, users can only read themselves
    read: ({ req: { user } }) => {
      if (user?.role === 'admin') return true
      return { id: { equals: user?.id } }
    },
    // Admins can create users
    create: ({ req: { user } }) => user?.role === 'admin',
    // Users can update themselves, admins can update all
    update: ({ req: { user } }) => {
      if (user?.role === 'admin') return true
      return { id: { equals: user?.id } }
    },
    // Only admins can delete users
    delete: ({ req: { user } }) => user?.role === 'admin',
  },
  fields: [
    { 
      name: 'name', 
      type: 'text', 
      required: true,
      index: true,
    },
    { 
      name: 'role', 
      type: 'select', 
      options: ['admin', 'user'], 
      defaultValue: 'user',
      // Only admins can change roles
      access: {
        update: ({ req: { user } }) => user?.role === 'admin',
      },
    },
    { 
      name: 'nextAuthId', 
      type: 'text', 
      unique: true, 
      admin: { readOnly: true },
      index: true,
    },
    { 
      name: 'avatarUrl', 
      type: 'text',
    },
    { 
      name: 'apiKey', 
      type: 'text',
      // API key is only visible to the owner
      access: {
        read: ({ req: { user }, doc }) => user?.id === doc?.id,
        update: ({ req: { user }, doc }) => user?.id === doc?.id,
      },
      admin: {
        hidden: true,
      },
    },
    {
      name: 'lastLoginAt',
      type: 'date',
      admin: {
        readOnly: true,
      },
    },
  ],
  hooks: {
    afterChange: [logUserActivity, trackLastLogin],
  },
}
