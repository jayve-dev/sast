import { Geist, Geist_Mono } from "next/font/google";
import "../globals.css";
import { Header } from "@/components/header";
import { auth } from "../../../lib/auth";
import { redirect } from "next/navigation";
import { SessionProvider } from "next-auth/react";
import { SidebarProvider } from "@/components/ui/sidebar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default async function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  const session = await auth();

  if(!session) {
    redirect("/signin"); 
  } else if (session.user.role !== "STUDENT") {
    redirect("/dashboard");
  }

  return (
    <SidebarProvider>
      <div
        className={`${geistSans.variable} ${geistMono.variable} antialiased h-screen w-screen overflow-x-hidden`}
      >
        <SessionProvider session={session}>
          <div className="w-full h-dvh flex flex-row items-center justify-center p-5 bg-[#2A4759] text-[#EEEEEE]">
            <div className="w-full h-full flex flex-col items-center justify-start gap-5">
              <Header />
              {children}
            </div>
          </div>
        </SessionProvider>
      </div>
    </SidebarProvider>
  );
}
