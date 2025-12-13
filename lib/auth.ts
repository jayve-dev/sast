import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { SignInSchema } from "../schema";
import { prisma } from "./db";
import bcrypt from "bcryptjs";

// Validate that AUTH_SECRET exists
if (!process.env.AUTH_SECRET && !process.env.NEXTAUTH_SECRET) {
  throw new Error(
    "AUTH_SECRET or NEXTAUTH_SECRET environment variable must be set"
  );
}

export const { auth, handlers, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma) as any, // Add 'as any' to fix type error
  trustHost: true, // CRITICAL: Required for Vercel
  secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET, // CRITICAL: Add secret
  providers: [
    Credentials({
      id: "credentials",
      name: "Credentials",
      credentials: {
        idNumber: { label: "ID Number", type: "text" },
        password: { label: "Password", type: "password" },
      },

      authorize: async (credentials): Promise<any> => {
        try {
          const { idNumber, password } = await SignInSchema.parseAsync(
            credentials
          );

          const idNumberInt = parseInt(idNumber, 10);
          if (Number.isNaN(idNumberInt)) {
            console.error("Invalid ID number format");
            return null;
          }

          const user = await prisma.user.findUnique({
            where: {
              idNumber: idNumberInt,
            },
          });

          if (!user) {
            console.error("User not found");
            return null;
          }

          const isValid = await bcrypt.compare(password, user.password);

          if (!isValid) {
            console.error("Invalid password");
            return null;
          }

          return {
            id: user.id,
            idNumber: user.idNumber,
            fullName: user.fullName,
            role: user.role,
            studentId: user.studentId || null, // Add studentId with fallback
          };
        } catch (error) {
          console.error("Authorization error:", error);
          return null;
        }
      },
    }),
  ],
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.idNumber = (user as any).idNumber;
        token.fullName = (user as any).fullName;
        token.role = (user as any).role;
        token.studentId = (user as any).studentId || null; // Add fallback
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.idNumber = token.idNumber as number;
        session.user.fullName = token.fullName as string;
        session.user.role = token.role as string;
        session.user.studentId =
          (token.studentId as string | undefined) || undefined; // Handle undefined
      }
      return session;
    },
  },
  debug: process.env.NODE_ENV === "development",
});
