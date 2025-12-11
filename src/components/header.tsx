"use client";
import React, { useState } from "react";
import Image from "next/image";
import { NavBar } from "./nav-bar";
import { FaHamburger } from "react-icons/fa";
import { RoleLabel } from "./role-label";

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className='relative w-full h-16 flex items-center justify-between sm:px-5 rounded-3xl bg-transparent'>
      {/* mobile view */}
      <button
        className='sm:hidden rounded-full p-3 h-fit w-fit flex items-center justify-center border-8 border-[#2A4759] z-20 bg-[#2A4759] -ml-3'
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? (
          <FaHamburger className='w-10 h-10' />
        ) : (
          <FaHamburger className='w-10 h-10 hover:animate-spin transform transition-transform duration-500' />
        )}
      </button>

      {isOpen && <NavBar />}

      {/* desktop view */}
      <div className="flex gap-10 items-center justify-center">
        {/* <div className='hidden sm:flex w-fit h-fit hover:scale-105 transition-transform duration-200 bg-red-500 rounded-sm px-3 py-1'>
          <LogoutModal/>
        </div> */}
      </div>

      {/* logo/profile(dependes sabot) */}
      <div className='flex items-center justify-center gap-3'>
        <RoleLabel />
        <Image
          width={0}
          height={0}
          src='/profileIcon.svg'
          alt='profile icon'
          className='w-12 h-12 rounded-full hover:scale-110 transition-transform duration-200'
        />
      </div>
    </div>
  );
};

export { Header };
