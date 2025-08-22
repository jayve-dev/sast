"use client";
import React, { useRef } from 'react'
import Lottie, { LottieRefCurrentProps } from "lottie-react";
import Header from './header';
import Footer from './footer';
import { Button } from '../ui/button';
import animationData from "../../assets/Survey.json"


const Welcome = () => {
      const surveyImage = useRef<LottieRefCurrentProps>(null);
    
  return (
    <div className='min-h-screen flex flex-col bg-[#FFFFE3]'>
      <Header />
      <div className='flex-1 flex items-center justify-center p-20 w-full'>
        <div className='flex flex-col md:flex-row items-center justify-between w-full gap-10'>
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
            <Button className='w-fit'>Come and support us!</Button>
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
  )
}

export { Welcome }
