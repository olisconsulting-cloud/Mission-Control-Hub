import { auth } from './auth'
import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@/payload/payload.config'

export async function requireAuth() {
  const session = await auth()
  if (!session?.user?.id) {
    throw new AuthError('Unauthorized', 401)
  }
  return session
}

export async function requireSpaceAccess(userId: string, spaceId: string) {
  const payload = await getPayload({ config })
  const space = await payload.findByID({ collection: 'spaces', id: spaceId })
  
  if (!space) throw new AuthError('Space not found', 404)
  
  const isOwner = space.owner === userId || (typeof space.owner === 'object' && space.owner?.id === userId)
  const isMember = Array.isArray(space.members) && space.members.some(
    (m: any) => m.user === userId || (typeof m.user === 'object' && m.user?.id === userId)
  )
  
  if (!isOwner && !isMember) {
    throw new AuthError('Forbidden', 403)
  }
  
  return { space, isOwner, isMember }
}

export async function requireOwnership(userId: string, resourceOwnerId: string) {
  const ownerId = typeof resourceOwnerId === 'object' ? (resourceOwnerId as any)?.id : resourceOwnerId
  if (userId !== ownerId) {
    throw new AuthError('Forbidden', 403)
  }
}

export class AuthError extends Error {
  status: number
  constructor(message: string, status: number) {
    super(message)
    this.name = 'AuthError'
    this.status = status
  }
}

export function handleAuthError(error: unknown) {
  if (error instanceof AuthError) {
    return NextResponse.json(
      { error: { code: error.status === 401 ? 'UNAUTHORIZED' : 'FORBIDDEN', message: error.message } },
      { status: error.status }
    )
  }
  console.error('Unexpected error:', error)
  return NextResponse.json(
    { error: { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred' } },
    { status: 500 }
  )
}
