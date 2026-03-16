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
    const notifications = await payload.find({
      collection: 'notifications',
      where: { user: { equals: session.user.id } },
      sort: '-createdAt',
      limit: 20,
    })

    return NextResponse.json(notifications)
  } catch (error) {
    console.error('Failed to fetch notifications:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
