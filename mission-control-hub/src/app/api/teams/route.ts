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
    const teams = await payload.find({
      collection: 'teams',
      where: {
        or: [
          { owner: { equals: session.user.id } },
          { 'members.user': { equals: session.user.id } },
        ],
      },
      sort: '-createdAt',
    })

    return NextResponse.json(teams)
  } catch (error) {
    console.error('Failed to fetch teams:', error)
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

    const team = await payload.create({
      collection: 'teams',
      data: {
        name: body.name,
        description: body.description || '',
        owner: session.user.id,
        members: [{ user: session.user.id, role: 'admin' }],
      },
    })

    return NextResponse.json(team, { status: 201 })
  } catch (error) {
    console.error('Failed to create team:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
