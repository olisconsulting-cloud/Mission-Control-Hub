export interface PaginatedResponse<T> {
  data: T[]
  meta: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export interface ErrorResponse {
  error: {
    code: string
    message: string
    details?: unknown
  }
}

export interface HealthCheck {
  status: 'healthy' | 'degraded' | 'unhealthy'
  checks: Record<string, { status: string; latencyMs?: number }>
  uptime: number
  timestamp: string
}

export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: {
    code: string
    message: string
    details?: unknown
  }
}

export interface RateLimitInfo {
  limit: number
  remaining: number
  reset: number
}
