import NextAuth, { type NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { type DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session extends DefaultSession {
    accessToken?: string;
    user: DefaultSession["user"] & {
      id?: string;
      is_superuser?: boolean;
    };
  }

  interface User {
    id?: string;
    email?: string;
    name?: string;
    is_superuser?: boolean;
    accessToken?: string;
  }
}

export const authConfig = {
  pages: {
    signIn: "/login",
    error: "/login",
  },
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        username: { label: "邮箱", type: "email", placeholder: "user@example.com" },
        password: { label: "密码", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          console.error("[Auth] Missing credentials");
          return null;
        }

        try {
          // 1. 调用 FastAPI 登录端点
          const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
          console.log("[Auth] Attempting login with API URL:", apiUrl);

          const tokenResponse = await fetch(`${apiUrl}/api/v1/login/access-token`, {
            method: "POST",
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
            },
            body: new URLSearchParams({
              username: String(credentials.username),
              password: String(credentials.password),
            }),
          });

          console.log("[Auth] Token response status:", tokenResponse.status);

          if (!tokenResponse.ok) {
            const errorData = await tokenResponse.json();
            console.error("[Auth] Login failed:", errorData);
            throw new Error(errorData.detail || "登录失败");
          }

          const tokenData = await tokenResponse.json();
          const accessToken = tokenData.access_token;

          // 2. 使用 token 获取用户信息
          const userResponse = await fetch(`${apiUrl}/api/v1/login/test-token`, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          });

          console.log("[Auth] User response status:", userResponse.status);

          if (!userResponse.ok) {
            const errorData = await userResponse.json();
            console.error("[Auth] Failed to get user info:", errorData);
            throw new Error("无法获取用户信息");
          }

          const userData = await userResponse.json();
          console.log("[Auth] Login successful for user:", userData.email);

          return {
            id: userData.id,
            email: userData.email,
            name: userData.full_name || userData.email,
            is_superuser: userData.is_superuser || false,
            accessToken,
          };
        } catch (error) {
          console.error("[Auth] Authorization error:", error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.is_superuser = user.is_superuser;
        token.accessToken = user.accessToken;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.is_superuser = token.is_superuser as boolean;
        session.accessToken = token.accessToken as string;
      }
      return session;
    },
  },
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 24 小时
    updateAge: 60 * 60, // 1 小时更新一次
  },
  jwt: {
    maxAge: 24 * 60 * 60, // 24 小时
  },
  secret: process.env.NEXTAUTH_SECRET,
  trustHost: true,
  debug: process.env.NODE_ENV === "development",
} satisfies NextAuthConfig;

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);
