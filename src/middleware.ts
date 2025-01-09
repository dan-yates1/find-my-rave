import NextAuth from "next-auth"
import { authConfig } from "./auth"

export const { auth: middleware } = NextAuth(authConfig)

export const config = {
  matcher: [
    "/profile/:path*",
    "/api/user/:path*",
    "/api/bookmarks/:path*",
    "/api/bookmarks/check/:path*",
  ],
} 