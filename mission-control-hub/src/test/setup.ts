import { vi, beforeAll, afterAll, afterEach } from 'vitest'

// Mock Payload
vi.mock('payload', () => ({
  getPayload: vi.fn(() => ({
    find: vi.fn(),
    findByID: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  })),
}))

// Mock NextAuth
vi.mock('@/lib/auth', () => ({
  auth: vi.fn(() => ({ 
    user: { 
      id: 'test-user-1', 
      email: 'test@example.com',
      name: 'Test User',
      role: 'user',
    } 
  })),
  signIn: vi.fn(),
  signOut: vi.fn(),
}))

// Mock Redis
vi.mock('@/lib/redis', () => ({
  redis: {
    pipeline: vi.fn(() => ({
      zremrangebyscore: vi.fn().mockReturnThis(),
      zadd: vi.fn().mockReturnThis(),
      zcard: vi.fn().mockReturnThis(),
      expire: vi.fn().mockReturnThis(),
      exec: vi.fn(() => [[null, 0], [null, 1], [null, 1], [null, 1]]),
    })),
    ping: vi.fn(() => 'PONG'),
    incr: vi.fn(() => 1),
    expire: vi.fn(),
    get: vi.fn(),
    set: vi.fn(),
    del: vi.fn(),
    status: 'ready',
  },
  isRedisAvailable: vi.fn(() => true),
}))

// Global test hooks
beforeAll(() => {
  // Set test environment variables
  process.env.DATABASE_URL = 'postgresql://test:test@localhost:5433/test'
  process.env.NEXTAUTH_SECRET = 'test-secret'
  process.env.PAYLOAD_SECRET = 'test-payload-secret'
})

afterEach(() => {
  // Clear all mocks after each test
  vi.clearAllMocks()
})

afterAll(() => {
  // Cleanup
  vi.restoreAllMocks()
})
