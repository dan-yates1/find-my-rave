import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import GoogleProvider from "next-auth/providers/google"
import CredentialsProvider from "next-auth/providers/credentials"
import prisma from "@/lib/prisma"
import bcrypt from "bcryptjs"
import type { NextAuthConfig } from "next-auth"

export const authConfig = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      allowDangerousEmailAccountLinking: true,
      profile(profile) {
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          image: profile.picture,
          role: "user",
        }
      },
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Missing credentials")
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        })

        if (!user || !user.password) {
          throw new Error("Invalid credentials")
        }

        const isValid = await bcrypt.compare(credentials.password as string, user.password as string)

        if (!isValid) {
          throw new Error("Invalid credentials")
        }

        return {
          id: user.id.toString(),
          name: user.name,
          email: user.email,
          image: user.image,
          role: user.role,
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id?.toString() || ""
        token.role = user.role?.toString() || "user"
        token.picture = user.image?.toString() || null
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id?.toString() || ""
        session.user.role = token.role?.toString() || "user"
        session.user.image = token.picture?.toString() || null
      }
      return session
    },
    async signIn({ user, account }) {
      if (account?.provider === "google") return true
      
      if (account?.provider === "credentials") {
        const existingUser = await prisma.user.findUnique({
          where: { email: user.email! },
        })
        return !!existingUser
      }
      return true
    },
  },
  session: { strategy: "jwt" },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: '/login-register',
    error: '/login-register',
  },
} satisfies NextAuthConfig

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig)