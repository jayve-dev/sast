"use client";
import React from "react";
import { motion } from "framer-motion";

const SideBar = () => {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <div className='h-full flex items-center mr-5 ml-8'>
      <div
        className={`relative w-auto h-full ${
          isOpen
            ? "bg-[#f79b72] max-h-[500px] p-5 rounded-lg shadow-lg shadow-[#0A0A0A]/50 transition-all duration-400"
            : "bg-transparent"
        }`}
      >
        <button
          className='absolute border-8 border-[#2A4759] rounded-full p-3 h-16 w-16 flex items-center justify-center bg-[#f79b72] z-10 -left-9 bottom-1/2'
          onClick={() => setIsOpen(!isOpen)}
        >
          X
        </button>
        <div className='w-full h-full flex flex-col items-center justify-between gap-4'>
          {isOpen && (
            <>
              <div className='flex flex-col items-center justify-center gap-7 w-full'>
                <motion.a
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 1 }}
                  href='/Dashboard'
                  className='shadow-lg shadow-[#0A0A0A]/50 p-2 rounded-lg w-full flex items-center justify-center hover:scale-105 transition-transform duration-200 bg-[#2A4759]'
                >
                  Home
                </motion.a>
                <motion.a
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 1, delay: 0.2 }}
                  href='/Dashboard'
                  className='shadow-lg shadow-[#0A0A0A]/50 p-2 rounded-lg w-full flex items-center justify-center hover:scale-105 transition-transform duration-200 bg-[#2A4759]'
                >
                  Questionnaire
                </motion.a>
              </div>
              <div>
                <button>Something</button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export { SideBar };
