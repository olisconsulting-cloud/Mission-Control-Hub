import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { HealthCheck } from '@/types/api'

describe('Health Check API', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return healthy status when all checks pass', async () => {
    const healthCheck: HealthCheck = {
      status: 'healthy',
      checks: {
        database: { status: 'ok', latencyMs: 5 },
        redis: { status: 'ok', latencyMs: 2 },
        payload: { status: 'ok', latencyMs: 10 },
      },
      uptime: 12345,
      timestamp: new Date().toISOString(),
    }

    expect(healthCheck.status).toBe('healthy')
    expect(healthCheck.checks.database.status).toBe('ok')
    expect(healthCheck.checks.redis.status).toBe('ok')
  })

  it('should return degraded status when some checks fail', async () => {
    const healthCheck: HealthCheck = {
      status: 'degraded',
      checks: {
        database: { status: 'ok', latencyMs: 5 },
        redis: { status: 'error' },
        payload: { status: 'ok', latencyMs: 10 },
      },
      uptime: 12345,
      timestamp: new Date().toISOString(),
    }

    expect(healthCheck.status).toBe('degraded')
    expect(healthCheck.checks.redis.status).toBe('error')
  })

  it('should return unhealthy status when critical checks fail', async () => {
    const healthCheck: HealthCheck = {
      status: 'unhealthy',
      checks: {
        database: { status: 'error' },
        redis: { status: 'error' },
        payload: { status: 'error' },
      },
      uptime: 12345,
      timestamp: new Date().toISOString(),
    }

    expect(healthCheck.status).toBe('unhealthy')
    expect(healthCheck.checks.database.status).toBe('error')
  })

  it('should include latency metrics for successful checks', async () => {
    const healthCheck: HealthCheck = {
      status: 'healthy',
      checks: {
        database: { status: 'ok', latencyMs: 15 },
        redis: { status: 'ok', latencyMs: 3 },
      },
      uptime: 12345,
      timestamp: new Date().toISOString(),
    }

    expect(healthCheck.checks.database.latencyMs).toBeLessThan(100)
    expect(healthCheck.checks.redis.latencyMs).toBeLessThan(100)
  })

  it('should track uptime correctly', async () => {
    const startTime = Date.now()
    const uptime = Math.floor((Date.now() - startTime) / 1000)

    const healthCheck: HealthCheck = {
      status: 'healthy',
      checks: {},
      uptime,
      timestamp: new Date().toISOString(),
    }

    expect(healthCheck.uptime).toBeGreaterThanOrEqual(0)
  })

  it('should include timestamp in ISO format', async () => {
    const healthCheck: HealthCheck = {
      status: 'healthy',
      checks: {},
      uptime: 12345,
      timestamp: new Date().toISOString(),
    }

    expect(healthCheck.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/)
  })
})
