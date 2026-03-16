import type { CollectionConfig } from 'payload'

export const Agents: CollectionConfig = {
  slug: 'agents',
  admin: {
    useAsTitle: 'name',
  },
  fields: [
    { name: 'name', type: 'text', required: true },
    { name: 'description', type: 'textarea' },
    {
      name: 'provider',
      type: 'select',
      options: [
        { label: 'OpenAI', value: 'openai' },
        { label: 'Anthropic', value: 'anthropic' },
        { label: 'Custom Webhook', value: 'webhook' },
      ],
      required: true,
    },
    { name: 'model', type: 'text', defaultValue: 'gpt-4o' },
    { name: 'apiKey', type: 'text', admin: { readOnly: false } },
    {
      name: 'config',
      type: 'group',
      fields: [
        { name: 'temperature', type: 'number', defaultValue: 0.7, min: 0, max: 2 },
        { name: 'maxTokens', type: 'number', defaultValue: 4096 },
        { name: 'systemPrompt', type: 'textarea' },
        { name: 'webhookUrl', type: 'text' },
      ],
    },
    {
      name: 'space',
      type: 'relationship',
      relationTo: 'spaces',
      required: true,
    },
    {
      name: 'owner',
      type: 'relationship',
      relationTo: 'users',
      required: true,
    },
    { name: 'active', type: 'checkbox', defaultValue: true },
    { name: 'icon', type: 'text', defaultValue: '🤖' },
  ],
}
