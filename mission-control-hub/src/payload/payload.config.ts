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
import { Tasks } from './collections/Tasks'
import { Agents } from './collections/Agents'
import { AgentUsage } from './collections/AgentUsage'
import { Activities } from './collections/Activities'
import { Notifications } from './collections/Notifications'
import { Budgets } from './collections/Budgets'
import { createPersonalSpace } from './hooks/createPersonalSpace'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

// Validate required environment variables
if (!process.env.PAYLOAD_SECRET && !process.env.NEXTAUTH_SECRET) {
  throw new Error('PAYLOAD_SECRET or NEXTAUTH_SECRET environment variable is required')
}

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is required')
}

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
    meta: {
      titleSuffix: '- Mission Control Hub',
      favicon: '/favicon.ico',
      ogImage: '/og-image.png',
    },
  },
  collections: [
    UsersWithHooks, 
    Teams, 
    Spaces, 
    Media, 
    Tasks, 
    Agents, 
    AgentUsage, 
    Activities, 
    Notifications, 
    Budgets
  ],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || process.env.NEXTAUTH_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URL,
    },
  }),
  sharp,
  cors: [
    process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    ...(process.env.CORS_ORIGINS?.split(',') || []),
  ].filter(Boolean),
  csrf: [
    process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    ...(process.env.CORS_ORIGINS?.split(',') || []),
  ].filter(Boolean),
  rateLimit: {
    window: 15 * 60 * 1000, // 15 minutes
    max: 100, // Max 100 requests per window per IP
    trustProxy: true,
  },
  serverURL: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
})
