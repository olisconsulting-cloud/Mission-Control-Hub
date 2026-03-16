import type { User } from './user'
import type { Space } from './space'

export interface Task {
  id: string
  title: string
  description?: unknown
  status: 'backlog' | 'todo' | 'in-progress' | 'review' | 'done'
  priority: 'low' | 'medium' | 'high' | 'critical'
  space: string | Space
  assignee?: string | User
  createdBy: string | User
  labels?: TaskLabel[]
  dueDate?: string
  completedAt?: string
  order: number
  dependencies?: string[] | Task[]
  createdAt: string
  updatedAt: string
}

export interface TaskLabel {
  name: string
  color: string
}

export const COLUMNS = [
  { id: 'backlog' as const, title: 'Backlog', icon: '📥', wipLimit: 0 },
  { id: 'todo' as const, title: 'Todo', icon: '📋', wipLimit: 10 },
  { id: 'in-progress' as const, title: 'In Progress', icon: '🔥', wipLimit: 5 },
  { id: 'review' as const, title: 'Review', icon: '👀', wipLimit: 3 },
  { id: 'done' as const, title: 'Done', icon: '✅', wipLimit: 0 },
] as const

export type ColumnId = typeof COLUMNS[number]['id']

export interface TaskStats {
  total: number
  byStatus: Record<string, number>
  byPriority: Record<string, number>
  completedThisWeek: number
  overdue: number
}

export interface TaskTrend {
  created: number
  completed: number
}
