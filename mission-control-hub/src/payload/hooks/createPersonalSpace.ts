import type { CollectionAfterChangeHook } from 'payload'

export const createPersonalSpace: CollectionAfterChangeHook = async ({
  doc,
  operation,
  req,
}) => {
  // Only run on user creation
  if (operation !== 'create') return doc

  try {
    // Check if personal space already exists (idempotency)
    const existing = await req.payload.find({
      collection: 'spaces',
      where: {
        and: [
          { owner: { equals: doc.id } },
          { type: { equals: 'personal' } },
        ],
      },
      limit: 1,
    })

    // Only create if no personal space exists
    if (existing.totalDocs === 0) {
      await req.payload.create({
        collection: 'spaces',
        data: {
          name: `${doc.name || doc.email}'s Space`,
          type: 'personal',
          owner: doc.id,
          icon: '👤',
          description: 'Your personal workspace',
          settings: {
            defaultTaskStatus: 'backlog',
            notifications: true,
            isPublic: false,
          },
        },
      })

      // Log activity
      await req.payload.create({
        collection: 'activities',
        data: {
          user: doc.id,
          action: 'space.created',
          details: {
            type: 'personal',
            auto: true,
          },
        },
      })
    }
  } catch (error) {
    // Log error but don't fail user creation
    console.error('Failed to create personal space for user', doc.id, error)
    
    // Optionally create a notification for admin
    if (req.payload) {
      try {
        const admins = await req.payload.find({
          collection: 'users',
          where: { role: { equals: 'admin' } },
          limit: 10,
        })

        for (const admin of admins.docs) {
          await req.payload.create({
            collection: 'notifications',
            data: {
              recipient: admin.id,
              type: 'system',
              title: 'Personal Space Creation Failed',
              message: `Failed to create personal space for user ${doc.email}`,
            },
          })
        }
      } catch (notifError) {
        console.error('Failed to notify admins', notifError)
      }
    }
  }

  return doc
}
