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
  adapter: PrismaAdapter(prisma) as any,
  trustHost: true,
  secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET,
  providers: [
    Credentials({
      id: "credentials",
      name: "Credentials",
      credentials: {
        idNumber: { label: "ID Number", type: "number" },
        password: { label: "Password", type: "password" },
      },

      authorize: async (credentials): Promise<any> => {
        try {
          // Validate with Zod schema
          const { idNumber, password } = await SignInSchema.parseAsync(
            credentials
          );

          const idNumberInt = parseInt(idNumber, 10);
          if (Number.isNaN(idNumberInt)) {
            console.error("❌ Invalid ID number format:", idNumber);
            return null;
          }

          console.log("🔍 Looking up user with ID:", idNumberInt);

          const user = await prisma.user.findUnique({
            where: {
              idNumber: idNumberInt,
            },
          });

          if (!user) {
            console.error("❌ User not found with ID:", idNumberInt);
            return null;
          }

          console.log("🔐 Comparing passwords...");
          const isValid = await bcrypt.compare(password, user.password);

          if (!isValid) {
            console.error("❌ Invalid password for user:", user.idNumber);
            return null;
          }

          return {
            id: user.id,
            idNumber: user.idNumber,
            fullName: user.fullName,
            role: user.role,
            studentId: user.studentId || null,
          };
        } catch (error) {
          console.error("❌ Authorization error:", error);
          if (error instanceof Error) {
            console.error("Error message:", error.message);
            console.error("Error stack:", error.stack);
          }
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
        console.log("📝 Creating JWT for user:", user.id);
        token.id = user.id;
        token.idNumber = (user as any).idNumber;
        token.fullName = (user as any).fullName;
        token.role = (user as any).role;
        token.programId = (user as any).programId || null;
        token.studentId = (user as any).studentId || null;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        console.log("📝 Creating session for user:", token.id);
        session.user.id = token.id as string;
        session.user.idNumber = token.idNumber as number;
        session.user.programId = token.studentId as string | undefined;
        session.user.fullName = token.fullName as string;
        session.user.role = token.role as string;
        session.user.studentId =
          (token.studentId as string | undefined) || undefined;
      }
      return session;
    },
  },
  debug: true, // Enable debug mode even in production temporarily
});
