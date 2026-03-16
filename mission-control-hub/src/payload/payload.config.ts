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
      slug: "projects",
      admin: { useAsTitle: "name" },
      fields: [
        { name: "name", type: "text", required: true },
        { name: "description", type: "textarea" },
        { name: "customerName", type: "text", label: "Customer" },
        { name: "status", type: "select", defaultValue: "active", options: ["active", "archived", "completed"] },
        { name: "createdBy", type: "relationship", relationTo: "users" },
      ],
    },
    {
      slug: "tasks",
      admin: { useAsTitle: "title" },
      fields: [
        { name: "title", type: "text", required: true },
        { name: "description", type: "textarea" },
        { name: "status", type: "select", defaultValue: "backlog", options: [
          { label: "Backlog", value: "backlog" },
          { label: "To Do", value: "todo" },
          { label: "In Progress", value: "in_progress" },
          { label: "Review", value: "review" },
          { label: "Done", value: "done" },
        ]},
        { name: "priority", type: "select", defaultValue: "medium", options: ["low", "medium", "high", "urgent"] },
        { name: "project", type: "relationship", relationTo: "projects", required: true },
        { name: "assignee", type: "relationship", relationTo: "users" },
        { name: "dueDate", type: "date" },
      ],
    },
    {
      slug: "files",
      upload: true,
      admin: { useAsTitle: "filename" },
      fields: [
        { name: "project", type: "relationship", relationTo: "projects", required: true },
        { name: "uploadedBy", type: "relationship", relationTo: "users" },
      ],
    },
    {
      slug: "messages",
      admin: { useAsTitle: "content" },
      fields: [
        { name: "content", type: "textarea", required: true },
        { name: "project", type: "relationship", relationTo: "projects", required: true },
        { name: "user", type: "relationship", relationTo: "users", required: true },
      ],
    },
  ],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || process.env.AUTH_SECRET || "",
  typescript: { outputFile: path.resolve(dirname, "payload-types.ts") },
  db: postgresAdapter({
    pool: { connectionString: process.env.DATABASE_URL || "" },
  }),
  sharp,
  plugins: [],
})
