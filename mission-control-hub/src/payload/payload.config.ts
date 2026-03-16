import { buildConfig } from "payload"
import { postgresAdapter } from "@payloadcms/db-postgres"
import { lexicalEditor } from "@payloadcms/richtext-lexical"
import path from "path"
import { fileURLToPath } from "url"
import sharp from "sharp"

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    user: "users",
    importMap: {
      baseDir: path.resolve(dirname, ".."),
    },
  },
  collections: [
    {
      slug: "users",
      auth: true,
      admin: { useAsTitle: "email" },
      fields: [
        { name: "name", type: "text" },
        { name: "role", type: "select", defaultValue: "user", options: ["admin", "user", "guest"] },
      ],
    },
    {
      slug: "spaces",
      admin: { useAsTitle: "name" },
      fields: [
        { name: "name", type: "text", required: true },
        { name: "description", type: "textarea" },
        { name: "type", type: "select", defaultValue: "team", options: ["personal", "team", "project"] },
        { name: "owner", type: "relationship", relationTo: "users", required: true },
      ],
    },
    {
      slug: "tasks",
      admin: { useAsTitle: "title" },
      fields: [
        { name: "title", type: "text", required: true },
        { name: "description", type: "textarea" },
        { name: "status", type: "select", defaultValue: "todo", options: ["backlog", "todo", "in_progress", "review", "done"] },
        { name: "priority", type: "select", defaultValue: "medium", options: ["low", "medium", "high", "urgent"] },
        { name: "assignee", type: "relationship", relationTo: "users" },
        { name: "space", type: "relationship", relationTo: "spaces", required: true },
        { name: "dueDate", type: "date" },
      ],
    },
    {
      slug: "teams",
      admin: { useAsTitle: "name" },
      fields: [
        { name: "name", type: "text", required: true },
        { name: "description", type: "textarea" },
        { name: "owner", type: "relationship", relationTo: "users", required: true },
      ],
    },
    {
      slug: "agents",
      admin: { useAsTitle: "name" },
      fields: [
        { name: "name", type: "text", required: true },
        { name: "type", type: "select", options: ["openai", "anthropic", "custom"] },
        { name: "model", type: "text" },
        { name: "systemPrompt", type: "textarea" },
        { name: "owner", type: "relationship", relationTo: "users", required: true },
        { name: "space", type: "relationship", relationTo: "spaces" },
        { name: "active", type: "checkbox", defaultValue: true },
      ],
    },
    {
      slug: "activities",
      fields: [
        { name: "user", type: "relationship", relationTo: "users" },
        { name: "action", type: "text", required: true },
        { name: "details", type: "json" },
        { name: "space", type: "relationship", relationTo: "spaces" },
      ],
    },
    {
      slug: "notifications",
      fields: [
        { name: "recipient", type: "relationship", relationTo: "users", required: true },
        { name: "title", type: "text", required: true },
        { name: "message", type: "textarea" },
        { name: "read", type: "checkbox", defaultValue: false },
        { name: "type", type: "select", options: ["info", "warning", "error", "success"] },
      ],
    },
    {
      slug: "media",
      upload: true,
      fields: [
        { name: "alt", type: "text" },
      ],
    },
  ],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || process.env.AUTH_SECRET || "",
  typescript: { outputFile: path.resolve(dirname, "payload-types.ts") },
  db: postgresAdapter({
    pool: { connectionString: process.env.DATABASE_URL || "" },
    push: true,
  }),
  sharp,
  plugins: [],
})

