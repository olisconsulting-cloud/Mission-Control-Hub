import type { CollectionAfterChangeHook } from 'payload'

export const createPersonalSpace: CollectionAfterChangeHook = async ({
  doc,
  operation,
  req,
}) => {
  if (operation !== 'create') return doc

  // Check if personal space already exists
  const existing = await req.payload.find({
    collection: 'spaces',
    where: {
      owner: { equals: doc.id },
      type: { equals: 'personal' },
    },
    limit: 1,
  })

  if (existing.totalDocs === 0) {
    await req.payload.create({
      collection: 'spaces',
      data: {
        name: `${doc.name || doc.email}'s Space`,
        type: 'personal',
        owner: doc.id,
        icon: '👤',
      },
    })
  }

  return doc
}
