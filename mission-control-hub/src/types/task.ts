export interface Task {
  id: string
  title: string
  description?: unknown
  status: 'backlog' | 'todo' | 'in-progress' | 'review' | 'done'
  priority: 'low' | 'medium' | 'high' | 'critical'
  space: string | { id: string; name: string }
  assignee?: string | { id: string; name: string; avatarUrl?: string }
  labels?: Array<{ name: string; color: string }>
  dueDate?: string
  order: number
  createdAt: string
  updatedAt: string
}

export const COLUMNS = [
  { id: 'backlog' as const, title: 'Backlog', icon: '📥', wipLimit: 0 },
  { id: 'todo' as const, title: 'Todo', icon: '📋', wipLimit: 10 },
  { id: 'in-progress' as const, title: 'In Progress', icon: '🔥', wipLimit: 5 },
  { id: 'review' as const, title: 'Review', icon: '👀', wipLimit: 3 },
  { id: 'done' as const, title: 'Done', icon: '✅', wipLimit: 0 },
] as const

export type ColumnId = typeof COLUMNS[number]['id']
