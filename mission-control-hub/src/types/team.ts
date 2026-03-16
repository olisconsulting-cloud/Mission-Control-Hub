import type { User } from './user'

export interface Team {
  id: string
  name: string
  description?: string
  owner: string | User
  members: TeamMember[]
  createdAt: string
  updatedAt: string
}

export interface TeamMember {
  user: string | User
  role: 'owner' | 'admin' | 'member' | 'viewer'
  joinedAt: string
}
