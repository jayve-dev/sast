import React from "react";
// import Image from 'next/image'
import { Button } from "@/components/ui/button";
import Link from "next/link";
// import { Separator } from "@/components/ui/separator";

import Header from "@/components/landingpage/header";

// import { SignInForm } from '@/components/ui/auth/SignInForm'

export default function Welcome() {
  return (
    // <div className="w-screen min-h-screen bg-[#FFFFF0] ">
    //   <div className="w-full h-dvh flex flex-row items-center  gap-2">
    //     <div className=" bg-gray-200 shadow-gray-900 shadow-4xl h-dvh sm:flex   hidden flex-col items-center justify-center rounded-r-lg  gap-2  w-full ">
    //         <h1 className="">SAST</h1>
    //     </div>

    //     <div className=" w-full h-dvh flex flex-col items-center justify-center gap-5">
    //       <div className=" p-4 flex bg-gray-200 rounded-2xl  gap-2">
    //         <Link href="/signin">
    //           <Button className="text-3xl p-6 hover:scale-110 transition-transform duration-200">
    //             Sign in
    //           </Button>
    //         </Link>
    //         <Separator
    //           orientation="vertical"
    //           className="max-h-[70px] bg-muted bg-gray-500"
    //         />
    //         <Link href="/signup">
    //           <Button className="text-3xl p-6 hover:scale-110 transition-transform duration-200">
    //             Sign up
    //           </Button>
    //         </Link>
    //       </div>
    //     </div>
    //   </div>
    // </div>
    //
    //
    //
    //   //   className="w-full h-screen bg-[#ffcfcf]"
    //   // style={{
    //   //   background:
    //   //     "radial-gradient(circle, rgba(255, 207, 207, 1) 2%, rgba(121, 91, 140, 1) 97%)",
    //   // }}
    // >
    <div className="relative min-h-dvh flex flex-col overflow-hidden">
      {/* Blurred background layer */}
      <div
        className="absolute inset-0"
        style={{
          backgroundColor: "#cecee9",
          backgroundImage:
            "repeating-radial-gradient(circle at 0 0, transparent 0, #cecee9 40px), repeating-linear-gradient(#51527055, #515270)",
          filter: "blur(8px)", // adjust blur strength as needed
        }}
      />

      {/* Foreground content */}
      <div className="relative z-10 min-h-dvh flex flex-col">
        <Header />

        <div className="flex flex-1 items-center text-[#f1f1f1] justify-center w-full">
          <div className="text-center px-4">
            <h1 className="font-bold text-4xl  text-shadow-lg/20">
              Help Us Improve Your Learning Experience
            </h1>
            <p className="text-md mt-6  text-shadow-lg/20">
              Your honest feedback helps us evaluate and improve teaching
              effectiveness. <br /> All responses are confidential and will be
              used for academic development.
            </p>

            <div className="mt-5 flex flex-row justify-center items-center w-full  gap-2">
              <div>
                <Link href="/signup">
                  <Button
                    variant="ghost"
                    className="text-md  hover:bg-gray-50 hover:text-black border p-4 hover:scale-105 transition-transform duration-200"
                  >
                    Learn More
                  </Button>
                </Link>
              </div>

              <div>
                <Link href="/signup">
                  <Button
                    variant="ghost"
                    className="text-md  hover:bg-white hover:text-black border p-4 hover:scale-105 transition-transform duration-200"
                  >
                    Contact Us
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* footer goes here */}
      </div>
    </div>
  );
}
