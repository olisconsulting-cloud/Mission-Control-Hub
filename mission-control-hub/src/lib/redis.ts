import Redis from 'ioredis'

const redisUrl = process.env.REDIS_URL
if (!redisUrl) {
  console.warn('REDIS_URL not set - Redis features will be unavailable')
}

export const redis = redisUrl
  ? new Redis(redisUrl, {
      maxRetriesPerRequest: 3,
      retryStrategy(times) {
        if (times > 3) return null
        return Math.min(times * 200, 2000)
      },
      lazyConnect: true,
    })
  : null

export function isRedisAvailable(): boolean {
  return redis !== null && redis.status === 'ready'
}
