import { Geist, Geist_Mono } from "next/font/google";
import "../globals.css";
import { SideBar } from "@/components/side-bar";

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
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased h-screen w-screen`}
      >
        <div className="w-full h-dvh flex flex-row items-center justify-between p-5 bg-[#2A4759] text-[#EEEEEE]">
          <SideBar />
          {children}
        </div>
      </body>
    </html>
  );
}
