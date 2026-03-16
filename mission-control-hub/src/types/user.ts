export interface User {
  id: string
  email: string
  name: string
  role: 'admin' | 'user'
  nextAuthId?: string
  avatarUrl?: string
  apiKey?: string
  lastLoginAt?: string
  createdAt: string
  updatedAt: string
}

export interface UserProductivity {
  tasksCreated: number
  tasksCompleted: number
  tasksAssigned: number
  completionRate: number
}
