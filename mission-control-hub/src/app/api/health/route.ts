import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@/payload/payload.config'
import { redis, isRedisAvailable } from '@/lib/redis'

export async function GET() {
  const checks: Record<string, { status: string; latencyMs?: number }> = {}
  
  // Database check
  try {
    const start = Date.now()
    const payload = await getPayload({ config })
    await payload.find({ collection: 'users', limit: 1 })
    checks.database = { status: 'healthy', latencyMs: Date.now() - start }
  } catch {
    checks.database = { status: 'unhealthy' }
  }
  
  // Redis check
  try {
    if (redis && isRedisAvailable()) {
      const start = Date.now()
      await redis.ping()
      checks.redis = { status: 'healthy', latencyMs: Date.now() - start }
    } else {
      checks.redis = { status: 'unavailable' }
    }
  } catch {
    checks.redis = { status: 'unhealthy' }
  }
  
  const allHealthy = Object.values(checks).every(c => c.status === 'healthy')
  const anyUnhealthy = Object.values(checks).some(c => c.status === 'unhealthy')
  
  return NextResponse.json(
    {
      status: anyUnhealthy ? 'unhealthy' : allHealthy ? 'healthy' : 'degraded',
      checks,
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    },
    { status: anyUnhealthy ? 503 : 200 }
  )
}
