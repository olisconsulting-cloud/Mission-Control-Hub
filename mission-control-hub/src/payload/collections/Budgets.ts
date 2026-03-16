import type { CollectionConfig } from 'payload'
import type { CollectionAfterChangeHook } from 'payload'

// Hook to check budget when agent usage is created
const checkBudgetOnUsage: CollectionAfterChangeHook = async ({ doc, operation, req }) => {
  if (operation !== 'create') return doc

  // This would be triggered from the agent usage collection
  // For now, we just return the doc
  return doc
}

export const Budgets: CollectionConfig = {
  slug: 'budgets',
  admin: {
    useAsTitle: 'space',
  },
  access: {
    // Space owner can CRUD
    read: async ({ req: { user, payload } }) => {
      if (!user) return false
      if (user.role === 'admin') return true

      // Get spaces owned by user
      const spaces = await payload.find({
        collection: 'spaces',
        where: { owner: { equals: user.id } },
        limit: 1000,
      })

      const spaceIds = spaces.docs.map((s) => s.id)

      return { space: { in: spaceIds } }
    },
    create: ({ req: { user } }) => !!user,
    update: async ({ req: { user, payload }, id }) => {
      if (!user) return false
      if (user.role === 'admin') return true

      const budget = await payload.findByID({ collection: 'budgets', id: id as string })
      if (!budget) return false

      const space = await payload.findByID({ collection: 'spaces', id: budget.space as string })
      return space?.owner === user.id
    },
    delete: async ({ req: { user, payload }, id }) => {
      if (!user) return false
      if (user.role === 'admin') return true

      const budget = await payload.findByID({ collection: 'budgets', id: id as string })
      if (!budget) return false

      const space = await payload.findByID({ collection: 'spaces', id: budget.space as string })
      return space?.owner === user.id
    },
  },
  fields: [
    {
      name: 'space',
      type: 'relationship',
      relationTo: 'spaces',
      required: true,
      index: true,
    },
    {
      name: 'period',
      type: 'select',
      options: [
        { label: 'Daily', value: 'daily' },
        { label: 'Weekly', value: 'weekly' },
        { label: 'Monthly', value: 'monthly' },
      ],
      required: true,
      defaultValue: 'monthly',
      index: true,
    },
    {
      name: 'amount',
      type: 'number',
      required: true,
      min: 0,
      admin: {
        description: 'Budget amount in the specified currency',
      },
    },
    {
      name: 'currency',
      type: 'select',
      options: [
        { label: 'USD', value: 'USD' },
        { label: 'EUR', value: 'EUR' },
        { label: 'GBP', value: 'GBP' },
      ],
      defaultValue: 'USD',
      required: true,
    },
    {
      name: 'softLimit',
      type: 'number',
      min: 0,
      max: 100,
      defaultValue: 80,
      admin: {
        description: 'Percentage of budget to trigger warning (default: 80%)',
      },
    },
    {
      name: 'hardLimit',
      type: 'number',
      min: 0,
      max: 100,
      defaultValue: 100,
      admin: {
        description: 'Percentage of budget to stop agent usage (default: 100%)',
      },
    },
    {
      name: 'currentUsage',
      type: 'number',
      defaultValue: 0,
      admin: {
        readOnly: true,
        description: 'Current period usage in currency',
      },
    },
    {
      name: 'resetDate',
      type: 'date',
      admin: {
        description: 'Date when the budget resets',
      },
    },
    {
      name: 'notifyOnSoftLimit',
      type: 'checkbox',
      defaultValue: true,
    },
    {
      name: 'notifyOnHardLimit',
      type: 'checkbox',
      defaultValue: true,
    },
  ],
  hooks: {
    afterChange: [checkBudgetOnUsage],
  },
  timestamps: true,
}
