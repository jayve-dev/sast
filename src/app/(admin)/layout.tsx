import { Geist, Geist_Mono } from "next/font/google";
import "../globals.css";
import { SideBar } from "@/components/side-bar";
import { Header } from "@/components/header";
import { auth } from "../../../lib/auth";
import { redirect } from "next/navigation";

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
  }

  return (
    <div lang='en'>
      <div
        className={`${geistSans.variable} ${geistMono.variable} antialiased h-screen w-screen overflow-x-hidden`}
      >
        <div className="w-full h-dvh flex flex-row items-center justify-center p-5 bg-[#2A4759] text-[#EEEEEE]">
          <SideBar />
          <div className="w-full h-full flex flex-col items-center justify-start gap-5">
            <Header />
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
