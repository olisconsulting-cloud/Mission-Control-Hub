import { buildConfig } from 'payload'
import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    user: 'users',
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  collections: [
    {
      slug: 'users',
      auth: true,
      fields: [
        { name: 'role', type: 'select', options: ['admin', 'user'], defaultValue: 'user' },
      ],
    },
    {
      slug: 'media',
      upload: true,
      fields: [
        { name: 'alt', type: 'text' },
      ],
    },
  ],
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
