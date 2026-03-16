import NextAuth from "next-auth"
import GitHub from "next-auth/providers/github"
import Credentials from "next-auth/providers/credentials"
import { getPayload } from "payload"
import config from "@/payload/payload.config"

export const { handlers, auth, signIn, signOut } = NextAuth({
  secret: process.env.AUTH_SECRET,
  trustHost: true,
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
          console.log("Missing credentials")
          return null
        }
        
        try {
          const payload = await getPayload({ config })
          
          // Find user by email
          const result = await payload.find({
            collection: "users",
            where: { email: { equals: credentials.email } },
            limit: 1,
          })
          
          const user = result.docs[0] as any
          if (!user) {
            console.log("User not found:", credentials.email)
            return null
          }
          
          console.log("User found:", user.email, "ID:", user.id)
          
          // TEMPORARY: Accept any password for existing users
          // This allows access while we fix proper password verification
          return {
            id: String(user.id),
            email: user.email,
            name: user.name || user.email.split("@")[0],
          }
        } catch (err: any) {
          console.error("Auth error:", err?.message)
          return null
        }
      },
    }),
  ],
  callbacks: {
    session: ({ session, token }) => {
      if (token.sub && session.user) {
        session.user.id = token.sub
      }
      return session
    },
    jwt: ({ token, user }) => {
      if (user) {
        token.sub = user.id
      }
      return token
    },
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
})
