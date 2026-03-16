import type { CollectionConfig } from 'payload'
import type { CollectionBeforeChangeHook, CollectionAfterChangeHook } from 'payload'

// Simple SSRF check for webhook URLs
const validateWebhookUrl: CollectionBeforeChangeHook = async ({ data }) => {
  const webhookUrl = data?.config?.webhookUrl
  
  if (webhookUrl) {
    try {
      const url = new URL(webhookUrl)
      
      // Block private IP ranges
      const hostname = url.hostname.toLowerCase()
      const privatePatterns = [
        /^localhost$/i,
        /^127\./,
        /^10\./,
        /^172\.(1[6-9]|2[0-9]|3[0-1])\./,
        /^192\.168\./,
        /^169\.254\./,
        /^::1$/,
        /^fc00:/,
        /^fe80:/,
      ]

      const isPrivate = privatePatterns.some(pattern => pattern.test(hostname))
      if (isPrivate) {
        throw new Error('Webhook URL cannot point to private IP addresses or localhost')
      }

      // Only allow http/https
      if (!['http:', 'https:'].includes(url.protocol)) {
        throw new Error('Webhook URL must use HTTP or HTTPS protocol')
      }
    } catch (err) {
      if (err instanceof Error && err.message.includes('Webhook')) {
        throw err
      }
      throw new Error('Invalid webhook URL format')
    }
  }

  return data
}

// Hook to log agent activity
const logAgentActivity: CollectionAfterChangeHook = async ({ doc, operation, req }) => {
  const action = operation === 'create' ? 'agent.created' : 'agent.updated'
  
  await req.payload.create({
    collection: 'activities',
    data: {
      user: req.user?.id,
      action,
      details: { agentId: doc.id, agentName: doc.name, provider: doc.provider },
      space: doc.space,
    },
  })

  return doc
}

export const Agents: CollectionConfig = {
  slug: 'agents',
  admin: {
    useAsTitle: 'name',
  },
  access: {
    // Owner and space members can read
    read: async ({ req: { user, payload } }) => {
      if (!user) return false
      if (user.role === 'admin') return true

      // Get all spaces where user is owner or member
      const spaces = await payload.find({
        collection: 'spaces',
        where: {
          or: [
            { owner: { equals: user.id } },
            { 'members.user': { equals: user.id } },
          ],
        },
        limit: 1000,
      })

      const spaceIds = spaces.docs.map((s) => s.id)

      return {
        or: [
          { owner: { equals: user.id } },
          { space: { in: spaceIds } },
        ],
      }
    },
    // Authenticated users can create agents
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
      name: 'type',
      type: 'select',
      options: [
        { label: 'Chat', value: 'chat' },
        { label: 'Task Automation', value: 'task' },
        { label: 'Webhook', value: 'webhook' },
      ],
      defaultValue: 'chat',
      index: true,
    },
    {
      name: 'provider',
      type: 'select',
      options: [
        { label: 'OpenAI', value: 'openai' },
        { label: 'Anthropic', value: 'anthropic' },
        { label: 'Custom Webhook', value: 'webhook' },
      ],
      required: true,
      index: true,
    },
    { 
      name: 'model', 
      type: 'text', 
      defaultValue: 'gpt-4o',
    },
    { 
      name: 'apiKey', 
      type: 'text',
      // API key is only visible/editable by owner
      access: {
        read: ({ req: { user }, doc }) => user?.id === doc?.owner,
        update: ({ req: { user }, doc }) => user?.id === doc?.owner,
      },
      admin: {
        hidden: true,
      },
    },
    {
      name: 'config',
      type: 'group',
      fields: [
        { 
          name: 'temperature', 
          type: 'number', 
          defaultValue: 0.7, 
          min: 0, 
          max: 2,
        },
        { 
          name: 'maxTokens', 
          type: 'number', 
          defaultValue: 4096,
        },
        { 
          name: 'systemPrompt', 
          type: 'textarea',
        },
        { 
          name: 'webhookUrl', 
          type: 'text',
          admin: {
            condition: (_, siblingData) => siblingData?.provider === 'webhook',
          },
        },
      ],
    },
    {
      name: 'space',
      type: 'relationship',
      relationTo: 'spaces',
      required: true,
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
      name: 'active', 
      type: 'checkbox', 
      defaultValue: true,
      index: true,
    },
    { 
      name: 'icon', 
      type: 'text', 
      defaultValue: '🤖',
    },
  ],
  hooks: {
    beforeChange: [validateWebhookUrl],
    afterChange: [logAgentActivity],
  },
}
