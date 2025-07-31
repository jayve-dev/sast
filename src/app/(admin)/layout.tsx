import { Geist, Geist_Mono } from "next/font/google";
import "../globals.css";
import { SideBar } from "@/components/side-bar";
import { Header } from "@/components/header";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='en'>
      <main
        className={`${geistSans.variable} ${geistMono.variable} antialiased h-screen w-screen`}
      >
        <div className="w-full h-dvh flex flex-row items-center justify-center p-5 bg-[#2A4759] text-[#EEEEEE]">
          <SideBar />
          <div className="w-full h-full flex flex-col items-center justify-start gap-5">
            <Header />
            {children}
          </div>
        </div>
      </main>
    </html>
  );
}
