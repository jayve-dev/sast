import { Geist, Geist_Mono } from "next/font/google";
import "../globals.css";

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
        <div className="w-full h-dvh flex flex-col md:flex-row items-center justify-around bg-[#2A4759] gap-3 p-10">
          <div className="hidden md:flex flex-col justify-center items-center ">
            <div className="text-white text-8xl">SAST</div>
            <div className="text-white">Student Assessment Survey for Teachers</div>
          </div>
          <div className="w-full max-w-[420px]">{children}</div>
        </div>
      </body>
    </html>
  );
}
