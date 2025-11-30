import NextAuth from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      fullName: string;
      role: string;
    };
  }

  interface User {
    id: string;
    role?: string;
    fullName?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: string;
    fullName: string;
  }
}
