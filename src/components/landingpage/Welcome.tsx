"use client";
import React, { useRef } from "react";
import Lottie, { LottieRefCurrentProps } from "lottie-react";
import Header from "./header";
import Footer from "./footer";
import { Button } from "../ui/button";
import animationData from "../../assets/Survey.json";

const Welcome = () => {
  const surveyImage = useRef<LottieRefCurrentProps>(null);

  return (
    <div className='h-dvh flex flex-col bg-[#FFFFE3]'>
      <Header />
      <div className='flex items-center justify-center w-full'>
        <div className='mt-36 sm:mt-0 flex flex-col md:flex-row items-center justify-between max-w-[90%] gap-10 p-3'>
          <div className='flex flex-1 flex-col gap-2 '>
            <h1 className='font-bold text-4xl md:text-6xl leading-tight'>
              Welcome to Sast <br />
            </h1>
            <h2 className='font-semibold text-xl'>
              {" "}
              Your innovative solution for survey assessment
            </h2>
            <p className='text-gray-600'>
              Join us to streamline your survey processes and enhance your data
              collection.
            </p>
          </div>
          <div className='flex flex-col justify-center sm:hidden w-full gap-4'>
            <a href='/signup'>
              <Button
                className='text-md text-white border-white hover:bg-white hover:text-black border p-4 hover:scale-105 transition-transform duration-200 w-full'
              >
                Sign up
              </Button>
            </a>

            <a href='/signin'>
              <Button
                className='text-md hover:bg-white hover:text-black p-4 bg-gray-900 hover:scale-105 transition-transform duration-200 w-full'
              >
                Sign in
              </Button>
            </a>
          </div>
          <div className='flex-1 hidden md:flex items-center justify-center'>
            <Lottie
              lottieRef={surveyImage}
              animationData={animationData}
              className='w-[400px] h-[400px] md:w-[600px] md:h-[600px]'
            />
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export { Welcome };
