import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { ZodError } from "zod";
import { SignInSchema } from "../schema";
import { prisma } from "./db";
import bcrypt from "bcryptjs";
import { error } from "console";
// import { PrismaAdapter } from "@auth/prisma-adapter";

// const adapter = PrismaAdapter(prisma);

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

          if (error instanceof ZodError) {
            console.error({ message: "Yawa ts", error });
          }
          
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
});
