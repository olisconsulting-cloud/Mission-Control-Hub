// Simple in-memory rate limiter (for serverless, use Redis in production)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()

interface RateLimitConfig {
  windowMs?: number
  maxRequests?: number
}

export function checkRateLimit(
  key: string,
  config: RateLimitConfig = {}
): { allowed: boolean; remaining: number; resetIn: number } {
  const { windowMs = 60000, maxRequests = 60 } = config
  const now = Date.now()

  const entry = rateLimitMap.get(key)

  if (!entry || now > entry.resetTime) {
    rateLimitMap.set(key, { count: 1, resetTime: now + windowMs })
    return { allowed: true, remaining: maxRequests - 1, resetIn: windowMs }
  }

  entry.count++

  if (entry.count > maxRequests) {
    return { allowed: false, remaining: 0, resetIn: entry.resetTime - now }
  }

  return { allowed: true, remaining: maxRequests - entry.count, resetIn: entry.resetTime - now }
}

// Cleanup old entries every 5 minutes
setInterval(() => {
  const now = Date.now()
  for (const [key, entry] of rateLimitMap) {
    if (now > entry.resetTime) {
      rateLimitMap.delete(key)
    }
  }
}, 300000)
