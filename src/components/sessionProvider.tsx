"use client";

import { SessionProvider as NextAuthProvider } from "next-auth/react";
import { ReactNode } from "react";

interface Props {
  children: ReactNode;
}

export function SessionProvider({ children }: Props) {
  return <NextAuthProvider>{children}</NextAuthProvider>;
}
