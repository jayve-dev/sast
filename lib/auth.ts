import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { SignInSchema } from "../schema";
import { prisma } from "./db";
import bcrypt from "bcryptjs";

export const { auth, handlers, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        idNumber: {},
        password: {},
      },

      authorize: async (credentials) => {
        const { idNumber, password } = await SignInSchema.parseAsync(
          credentials
        );

        const idNumberInt = parseInt(idNumber, 10);
        if (Number.isNaN(idNumberInt)) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: {
            idNumber: idNumberInt,
          },
        });

        if (!user) {
          return null;
        }

        const isValid = await bcrypt.compare(password, user.password);

        if (!isValid) {
          return null;
        }

        return {
          id: user.id,
          idNumber: user.idNumber,
          fullName: user.fullName,
          role: user.role,
        };
      },
    }),
  ],
  pages: {
    signIn: "/signin",
  },
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.idNumber = user.idNumber;
        token.fullName = user.fullName;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.idNumber = token.idNumber as number;
        session.user.fullName = token.fullName as string;
        session.user.role = token.role as string;
      }
      return session;
    },
  },
});
