import { redis } from './redis'
import { NextResponse } from 'next/server'

interface RateLimitConfig {
  windowMs: number
  maxRequests: number
  keyPrefix?: string
}

const defaultConfig: RateLimitConfig = {
  windowMs: 60_000,
  maxRequests: 60,
  keyPrefix: 'rl',
}

export async function checkRateLimit(
  identifier: string,
  config: Partial<RateLimitConfig> = {}
): Promise<{ allowed: boolean; remaining: number; resetAt: number }> {
  const { windowMs, maxRequests, keyPrefix } = { ...defaultConfig, ...config }
  
  if (!redis) {
    // Fallback: allow if Redis unavailable
    return { allowed: true, remaining: maxRequests, resetAt: Date.now() + windowMs }
  }
  
  const key = `${keyPrefix}:${identifier}`
  const now = Date.now()
  const windowStart = now - windowMs
  
  const pipeline = redis.pipeline()
  pipeline.zremrangebyscore(key, 0, windowStart)
  pipeline.zadd(key, now.toString(), `${now}-${Math.random()}`)
  pipeline.zcard(key)
  pipeline.expire(key, Math.ceil(windowMs / 1000))
  
  const results = await pipeline.exec()
  const count = (results?.[2]?.[1] as number) || 0
  const allowed = count <= maxRequests
  
  return {
    allowed,
    remaining: Math.max(0, maxRequests - count),
    resetAt: now + windowMs,
  }
}

export function rateLimitResponse(resetAt: number) {
  return NextResponse.json(
    { error: { code: 'RATE_LIMITED', message: 'Too many requests' } },
    {
      status: 429,
      headers: { 'Retry-After': Math.ceil((resetAt - Date.now()) / 1000).toString() },
    }
  )
}
