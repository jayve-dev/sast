import { Geist, Geist_Mono } from "next/font/google";
import "../globals.css";
import { auth } from "../../../lib/auth";
import { redirect } from "next/navigation";
import { SessionProvider } from "next-auth/react";

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
}: Readonly<{ children: React.ReactNode }>) {
  const session = await auth();

  if (session) {
    redirect("/dashboard");
  }

  return (
    <div lang='en'>
      <div
        className={`${geistSans.variable} ${geistMono.variable} antialiased h-screen w-screen`}
      >
        <SessionProvider session={session}>
          <div className='w-full h-dvh flex flex-col lg:flex-row items-center justify-around gap-3 p-10'>
            <div className='flex flex-col justify-center items-center '>
              <div className='text-white text-8xl'>SAST</div>
              <div className='text-white hidden lg:flex'>
                Student Assessment Survey for Teachers
              </div>
            </div>
            <div className='w-full max-w-[420px]'>{children}</div>
          </div>
        </SessionProvider>
      </div>
    </div>
  );
}
