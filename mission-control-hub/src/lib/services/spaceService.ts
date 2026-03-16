import { getPayload } from 'payload'
import config from '@/payload/payload.config'

export const spaceService = {
  async findByUser(userId: string) {
    const payload = await getPayload({ config })
    return payload.find({
      collection: 'spaces',
      where: {
        or: [
          { owner: { equals: userId } },
          { 'members.user': { equals: userId } },
        ],
      },
      sort: '-createdAt',
    })
  },

  async findById(spaceId: string) {
    const payload = await getPayload({ config })
    return payload.findByID({ collection: 'spaces', id: spaceId })
  },

  async findByType(userId: string, type: 'personal' | 'team' | 'project' | 'client') {
    const payload = await getPayload({ config })
    return payload.find({
      collection: 'spaces',
      where: {
        and: [
          { type: { equals: type } },
          {
            or: [
              { owner: { equals: userId } },
              { 'members.user': { equals: userId } },
            ],
          },
        ],
      },
      sort: '-createdAt',
    })
  },

  async getPersonalSpace(userId: string) {
    const payload = await getPayload({ config })
    const result = await payload.find({
      collection: 'spaces',
      where: {
        and: [
          { owner: { equals: userId } },
          { type: { equals: 'personal' } },
        ],
      },
      limit: 1,
    })

    return result.docs[0] || null
  },

  async create(data: Record<string, unknown>, userId: string) {
    const payload = await getPayload({ config })
    return payload.create({
      collection: 'spaces',
      data: { ...data, owner: userId },
    })
  },

  async update(spaceId: string, data: Record<string, unknown>) {
    const payload = await getPayload({ config })
    return payload.update({ collection: 'spaces', id: spaceId, data })
  },

  async delete(spaceId: string) {
    const payload = await getPayload({ config })
    return payload.delete({ collection: 'spaces', id: spaceId })
  },

  async addMember(spaceId: string, userId: string, role: 'owner' | 'admin' | 'member' | 'viewer' = 'member') {
    const payload = await getPayload({ config })
    const space = await payload.findByID({ collection: 'spaces', id: spaceId })

    const members = space.members || []
    
    // Check if user is already a member
    const existingMember = members.find((m: any) => m.user === userId || m.user?.id === userId)
    if (existingMember) {
      throw new Error('User is already a member of this space')
    }

    members.push({
      user: userId,
      role,
      joinedAt: new Date().toISOString(),
    })

    return payload.update({
      collection: 'spaces',
      id: spaceId,
      data: { members },
    })
  },

  async removeMember(spaceId: string, userId: string) {
    const payload = await getPayload({ config })
    const space = await payload.findByID({ collection: 'spaces', id: spaceId })

    const members = (space.members || []).filter(
      (m: any) => m.user !== userId && m.user?.id !== userId
    )

    return payload.update({
      collection: 'spaces',
      id: spaceId,
      data: { members },
    })
  },

  async updateMemberRole(spaceId: string, userId: string, role: 'owner' | 'admin' | 'member' | 'viewer') {
    const payload = await getPayload({ config })
    const space = await payload.findByID({ collection: 'spaces', id: spaceId })

    const members = (space.members || []).map((m: any) => {
      if (m.user === userId || m.user?.id === userId) {
        return { ...m, role }
      }
      return m
    })

    return payload.update({
      collection: 'spaces',
      id: spaceId,
      data: { members },
    })
  },

  async getStats(spaceId: string) {
    const payload = await getPayload({ config })
    
    // Get task stats
    const tasks = await payload.find({
      collection: 'tasks',
      where: { space: { equals: spaceId } },
      limit: 0,
    })

    // Get agent stats
    const agents = await payload.find({
      collection: 'agents',
      where: { space: { equals: spaceId } },
      limit: 0,
    })

    // Get space details
    const space = await payload.findByID({ collection: 'spaces', id: spaceId })

    return {
      tasks: tasks.totalDocs,
      agents: agents.totalDocs,
      members: (space.members || []).length + 1, // +1 for owner
      type: space.type,
    }
  },
}
