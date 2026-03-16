import type { User } from './user'
import type { Team } from './team'

export interface Space {
  id: string
  name: string
  description?: string
  type: 'personal' | 'team' | 'project' | 'client'
  owner: string | User
  team?: string | Team
  members: SpaceMember[]
  settings: SpaceSettings
  color: string
  icon: string
  createdAt: string
  updatedAt: string
}

export interface SpaceMember {
  user: string | User
  role: 'owner' | 'admin' | 'member' | 'viewer'
  joinedAt: string
}

export interface SpaceSettings {
  defaultTaskStatus: string
  notifications: boolean
  isPublic: boolean
}

export interface SpaceStats {
  tasks: number
  agents: number
  members: number
  type: Space['type']
}

export interface SpaceHealth {
  healthScore: number
  overdueTasks: number
  blockedTasks: number
  inProgressTasks: number
  completedThisWeek: number
  totalTasks: number
}
