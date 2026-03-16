import NextAuth from "next-auth"
import GitHub from "next-auth/providers/github"
import Credentials from "next-auth/providers/credentials"
import { getPayload } from "payload"
import config from "@/payload/payload.config"
import bcrypt from "bcryptjs"

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    GitHub({
      clientId: process.env.AUTH_GITHUB_ID!,
      clientSecret: process.env.AUTH_GITHUB_SECRET!,
    }),
    Credentials({
      name: "Email",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const payload = await getPayload({ config })
        
        const { docs: users } = await payload.find({
          collection: "users",
          where: { email: { equals: credentials.email } },
          limit: 1,
        })

        const user = users[0]
        if (!user) return null

        const isValid = await bcrypt.compare(credentials.password, user.password || "")
        if (!isValid) return null

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.avatar,
        }
      },
    }),
  ],
  callbacks: {
    session: ({ session, token }) => ({
      ...session,
      user: { ...session.user, id: token.sub },
    }),
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
})
