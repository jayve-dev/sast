import NextAuth from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      idNumber: number;
      fullName: string;
      role: string;
      studentId?: string;
      programId?: string;
    };
  }

  interface User {
    id: string;
    idNumber: number;
    fullName: string;
    role: string;
    studentId?: string;
    programId?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    idNumber: number;
    fullName: string;
    role: string;
    studentId?: string;
    programId?: string;
  }
}
