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
        if (!credentials?.email || !credentials?.password) return null
        
        try {
          const payload = await getPayload({ config })
          
          // Find user by email using Payload API
          const result = await payload.find({
            collection: "users",
            where: { email: { equals: credentials.email } },
            limit: 1,
          })
          
          const user = result.docs[0]
          if (!user) return null
          
          // Payload handles password verification internally
          // Try to login via Payload auth API
          try {
            const loginResult = await payload.login({
              collection: "users",
              data: {
                email: credentials.email,
                password: credentials.password,
              },
            })
            
            if (loginResult.user) {
              return {
                id: String(loginResult.user.id),
                email: loginResult.user.email,
                name: loginResult.user.name || loginResult.user.email.split("@")[0],
              }
            }
          } catch (loginErr) {
            console.error("Login failed:", loginErr)
            return null
          }
          
          return null
        } catch (err) {
          console.error("Auth error:", err)
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

