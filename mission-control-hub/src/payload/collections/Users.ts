import { CollectionConfig } from "payload/types"
import bcrypt from "bcryptjs"

export const Users: CollectionConfig = {
  slug: "users",
  auth: {
    tokenExpiration: 7200,
    verify: true,
    maxLoginAttempts: 5,
    lockTime: 600 * 1000,
  },
  admin: {
    useAsTitle: "email",
    defaultColumns: ["email", "name", "role", "createdAt"],
  },
  access: {
    create: () => true,
    read: ({ req: { user } }) => {
      if (user?.role === "admin") return true
      return { id: { equals: user?.id } }
    },
    update: ({ req: { user } }) => {
      if (user?.role === "admin") return true
      return { id: { equals: user?.id } }
    },
    delete: ({ req: { user } }) => {
      return user?.role === "admin"
    },
  },
  fields: [
    {
      name: "name",
      type: "text",
      required: true,
      index: true,
    },
    {
      name: "email",
      type: "email",
      required: true,
      unique: true,
      index: true,
    },
    {
      name: "password",
      type: "text",
      required: false,
      admin: {
        hidden: true,
      },
      access: {
        read: () => false,
        update: ({ req: { user }, doc }) => {
          return user?.id === doc?.id || user?.role === "admin"
        },
      },
      hooks: {
        beforeChange: [
          async ({ value, operation }) => {
            if (operation === "create" || operation === "update") {
              if (value && value.length > 0) {
                return await bcrypt.hash(value, 10)
              }
            }
            return value
          },
        ],
      },
    },
    {
      name: "role",
      type: "select",
      required: true,
      defaultValue: "user",
      options: [
        { label: "Admin", value: "admin" },
        { label: "User", value: "user" },
        { label: "Guest", value: "guest" },
      ],
      access: {
        update: ({ req: { user } }) => user?.role === "admin",
      },
      index: true,
    },
    {
      name: "avatar",
      type: "upload",
      relationTo: "media",
    },
    {
      name: "apiKey",
      type: "text",
      unique: true,
      access: {
        read: ({ req: { user }, doc }) => {
          if (user?.role === "admin") return true
          return user?.id === doc?.id
        },
        update: ({ req: { user }, doc }) => user?.id === doc?.id,
      },
      hooks: {
        beforeChange: [
          ({ value }) => {
            if (!value) {
              return `pk_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`
            }
            return value
          },
        ],
      },
    },
    {
      name: "preferences",
      type: "group",
      fields: [
        {
          name: "theme",
          type: "select",
          defaultValue: "light",
          options: [
            { label: "Light", value: "light" },
            { label: "Dark", value: "dark" },
            { label: "Auto", value: "auto" },
          ],
        },
        {
          name: "notifications",
          type: "checkbox",
          defaultValue: true,
        },
        {
          name: "language",
          type: "select",
          defaultValue: "de",
          options: [
            { label: "Deutsch", value: "de" },
            { label: "English", value: "en" },
          ],
        },
      ],
    },
    {
      name: "lastLoginAt",
      type: "date",
      admin: {
        readOnly: true,
      },
    },
  ],
  hooks: {
    beforeChange: [
      async ({ operation, data, req }) => {
        if (operation === "update" && req.user?.id === data.id) {
          data.lastLoginAt = new Date().toISOString()
        }
        return data
      },
    ],
    afterChange: [
      async ({ operation, doc, req }) => {
        if (operation === "create") {
          await req.payload.create({
            collection: "activities",
            data: {
              user: doc.id,
              action: "user_created",
              details: { email: doc.email },
            },
          })
        }
      },
    ],
  },
  timestamps: true,
}

