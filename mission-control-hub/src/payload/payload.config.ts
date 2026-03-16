import { buildConfig } from 'payload'
import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

import { Users } from './collections/Users'
import { Teams } from './collections/Teams'
import { Spaces } from './collections/Spaces'
import { Media } from './collections/Media'
import { createPersonalSpace } from './hooks/createPersonalSpace'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

// Add hook to Users collection
const UsersWithHooks = {
  ...Users,
  hooks: {
    ...Users.hooks,
    afterChange: [
      ...(Users.hooks?.afterChange || []),
      createPersonalSpace,
    ],
  },
}

export default buildConfig({
  admin: {
    user: 'users',
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  collections: [UsersWithHooks, Teams, Spaces, Media],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || process.env.NEXTAUTH_SECRET || 'default-secret-change-me',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URL || '',
    },
  }),
  sharp,
})
