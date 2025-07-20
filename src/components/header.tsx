"use client";
import React, { useState } from "react";
import { Input } from "./ui/input";
import { IoSearch } from "react-icons/io5";
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
          <FaHamburger className="w-10 h-10"/>
        ) : (
          <FaHamburger className="w-10 h-10 hover:animate-spin transform transition-transform duration-500" />
        )}
      </button>

      {isOpen && <NavBar />}

      {/* desktop view */}
      {/* search */}
      <div className='relative hidden sm:flex w-fit h-fit hover:scale-105 transition-transform duration-200 bg-[#FAF9F6] rounded-lg'>
        <Input placeholder='Search...' />
        <button className='absolute right-3 top-1/2 transform -translate-y-1/2 text-black bg-trasnsparent w-fit h-fit p-1 hover:scale-110 transition-transform duration-200'>
          <IoSearch className='w-5 h-5' />
        </button>
      </div>

      {/* logo/profile(dependes sabot) */}
      <div className="flex items-center justify-center gap-3">
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
