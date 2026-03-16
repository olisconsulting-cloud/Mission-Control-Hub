import { getPayload } from 'payload'
import config from '@payload-config'

interface GitHubProfile {
  id: string
  name: string
  email: string
  image?: string
}

export async function syncUserToPayload(profile: GitHubProfile) {
  const payload = await getPayload({ config })

  // Find existing user by nextAuthId
  const existing = await payload.find({
    collection: 'users',
    where: { nextAuthId: { equals: profile.id } },
    limit: 1,
  })

  if (existing.totalDocs > 0) {
    return existing.docs[0]
  }

  // Create new user (triggers createPersonalSpace hook)
  const user = await payload.create({
    collection: 'users',
    data: {
      name: profile.name || profile.email,
      email: profile.email,
      nextAuthId: profile.id,
      avatarUrl: profile.image || '',
      password: crypto.randomUUID(), // Required by Payload auth, not used
    },
  })

  return user
}
