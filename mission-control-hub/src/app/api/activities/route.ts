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
    const activities = await payload.find({
      collection: 'activities',
      sort: '-createdAt',
      limit: 50,
    })

    return NextResponse.json(activities)
  } catch (error) {
    console.error('Failed to fetch activities:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
