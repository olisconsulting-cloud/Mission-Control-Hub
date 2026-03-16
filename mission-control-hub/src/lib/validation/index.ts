import { NextRequest, NextResponse } from 'next/server'
import { ZodSchema, ZodError } from 'zod'
import { paginationSchema, type Pagination } from './schemas'

interface ApiError {
  error: {
    code: string
    message: string
    details?: unknown
  }
}

export function errorResponse(code: string, message: string, status: number, details?: unknown): NextResponse<ApiError> {
  return NextResponse.json({ error: { code, message, ...(details && { details }) } }, { status })
}

export async function validateBody<T>(schema: ZodSchema<T>, request: NextRequest): Promise<T> {
  const body = await request.json().catch(() => null)
  if (!body) throw new ValidationError('Invalid JSON body')
  return schema.parse(body)
}

export function validateQuery(request: NextRequest): Pagination {
  const params = Object.fromEntries(request.nextUrl.searchParams.entries())
  return paginationSchema.parse(params)
}

export function paginatedResponse<T>(data: T[], total: number, pagination: Pagination) {
  return NextResponse.json({
    data,
    meta: {
      page: pagination.page,
      limit: pagination.limit,
      total,
      totalPages: Math.ceil(total / pagination.limit),
    },
  })
}

export class ValidationError extends Error {
  details?: unknown
  constructor(message: string, details?: unknown) {
    super(message)
    this.name = 'ValidationError'
    this.details = details
  }
}

export function handleApiError(error: unknown): NextResponse {
  if (error instanceof ZodError) {
    return errorResponse('VALIDATION_ERROR', 'Invalid input', 400, error.errors)
  }
  if (error instanceof ValidationError) {
    return errorResponse('VALIDATION_ERROR', error.message, 400, error.details)
  }
  console.error('API Error:', error)
  return errorResponse('INTERNAL_ERROR', 'An unexpected error occurred', 500)
}
