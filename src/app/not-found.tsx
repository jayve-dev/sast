"use client";
import { useRef } from "react";
import Lottie, { LottieRefCurrentProps } from "lottie-react";
import animationData from "../assets/Lonely 404.json";
// import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function NotFound() {
  const phoneRef = useRef<LottieRefCurrentProps>(null);
  const router = useRouter();
  return (
    <div>
      <div className="flex flex-col min-h-screen bg-white  ">
        <div className="w-full flex flex-col flex-1 items-center justify-center">
          <div>
            <Lottie lottieRef={phoneRef} animationData={animationData}></Lottie>
          </div>
          <div className="flex flex-col items-center justify-center gap-4 text-center p-6">
            <h2 className="text-2xl font-semibold text-foreground">
              Page Not Available
            </h2>
            <p className="text-muted-foreground max-w-md">
              The page you are trying to access might have been removed, had its
              name changed, or is temporarily unavailable.
            </p>
            <Button
              onClick={() => router.back()}
              className="mt-2 flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Go Back to Previous Page
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
