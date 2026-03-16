import type { User } from '@/types/user'
import type { Space } from '@/types/space'
import type { Task } from '@/types/task'
import type { Agent } from '@/types/agent'

// Factory functions for test data

export const createMockUser = (overrides: Partial<User> = {}): User => ({
  id: 'user-1',
  email: 'test@example.com',
  name: 'Test User',
  role: 'user',
  nextAuthId: 'nextauth-1',
  avatarUrl: 'https://example.com/avatar.png',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ...overrides,
})

export const createMockSpace = (overrides: Partial<Space> = {}): Space => ({
  id: 'space-1',
  name: 'Test Space',
  description: 'A test space',
  type: 'personal',
  owner: 'user-1',
  members: [],
  settings: {
    defaultTaskStatus: 'backlog',
    notifications: true,
    isPublic: false,
  },
  color: '#22c55e',
  icon: '🚀',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ...overrides,
})

export const createMockTask = (overrides: Partial<Task> = {}): Task => ({
  id: 'task-1',
  title: 'Test Task',
  description: 'A test task',
  status: 'todo',
  priority: 'medium',
  space: 'space-1',
  createdBy: 'user-1',
  order: 0,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ...overrides,
})

export const createMockAgent = (overrides: Partial<Agent> = {}): Agent => ({
  id: 'agent-1',
  name: 'Test Agent',
  description: 'A test agent',
  type: 'chat',
  provider: 'openai',
  model: 'gpt-4o',
  config: {
    temperature: 0.7,
    maxTokens: 4096,
  },
  space: 'space-1',
  owner: 'user-1',
  active: true,
  icon: '🤖',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ...overrides,
})

// Helper to create mock Payload response
export const createMockPayloadResponse = <T>(docs: T[], total?: number) => ({
  docs,
  totalDocs: total ?? docs.length,
  limit: 50,
  totalPages: Math.ceil((total ?? docs.length) / 50),
  page: 1,
  pagingCounter: 1,
  hasPrevPage: false,
  hasNextPage: false,
  prevPage: null,
  nextPage: null,
})

// Helper to wait for async operations
export const waitFor = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

// Helper to create mock request context
export const createMockRequestContext = (user?: Partial<User>) => ({
  user: user ? createMockUser(user) : null,
  payload: {
    find: vi.fn(),
    findByID: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
})
