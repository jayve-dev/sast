import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
// import { ZodError } from "zod";
import { SignInSchema } from "../schema";
import { prisma } from "./db";
import bcrypt from "bcryptjs";
// import { error } from "console";

export const { auth, handlers, signIn, signOut } = NextAuth({
  // adapter,
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

        // if (error instanceof ZodError) {
        //   console.error({ message: "Yawa ts", error });
        // }

        return user;
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
        token.role = user.role;
        token.fullName = user.fullName;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.fullName = token.fullName as string;
      }
      return session;
    },
  },
});
