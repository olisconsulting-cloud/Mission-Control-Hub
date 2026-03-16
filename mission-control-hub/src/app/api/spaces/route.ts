import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { auth } from '@/lib/auth'

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = await getPayload({ config })
    const spaces = await payload.find({
      collection: 'spaces',
      where: {
        owner: { equals: session.user.id },
      },
      sort: '-createdAt',
    })

    return NextResponse.json(spaces)
  } catch (error) {
    console.error('Failed to fetch spaces:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const payload = await getPayload({ config })

    const space = await payload.create({
      collection: 'spaces',
      data: {
        name: body.name,
        type: body.type || 'personal',
        description: body.description || '',
        owner: session.user.id,
        icon: body.icon || '🚀',
        color: body.color || '#22c55e',
      },
    })

    return NextResponse.json(space, { status: 201 })
  } catch (error) {
    console.error('Failed to create space:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
