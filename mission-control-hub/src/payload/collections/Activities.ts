import type { CollectionConfig } from 'payload'

export const Activities: CollectionConfig = {
  slug: 'activities',
  fields: [
    {
      name: 'type',
      type: 'select',
      options: [
        { label: 'Task Created', value: 'task_created' },
        { label: 'Task Moved', value: 'task_moved' },
        { label: 'Task Completed', value: 'task_completed' },
        { label: 'Task Deleted', value: 'task_deleted' },
        { label: 'Agent Chat', value: 'agent_chat' },
        { label: 'Space Created', value: 'space_created' },
        { label: 'Team Created', value: 'team_created' },
        { label: 'Member Joined', value: 'member_joined' },
      ],
      required: true,
    },
    { name: 'message', type: 'text', required: true },
    { name: 'user', type: 'relationship', relationTo: 'users', required: true },
    { name: 'space', type: 'relationship', relationTo: 'spaces' },
    { name: 'metadata', type: 'json' },
  ],
}
