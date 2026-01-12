import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    accessToken?: string;
    user: {
      id?: string;
      is_superuser?: boolean;
    } & DefaultSession["user"];
  }

  interface User {
    id?: string;
    email?: string;
    name?: string;
    is_superuser?: boolean;
    accessToken?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken?: string;
    id?: string;
    is_superuser?: boolean;
  }
}
