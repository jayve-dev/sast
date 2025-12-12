"use client";
import React, { useState } from "react";
import Image from "next/image";
import { NavBar } from "./nav-bar";
import { FaHamburger } from "react-icons/fa";
import { RoleLabel } from "./role-label";
import { SidebarTrigger } from "./ui/sidebar";

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className='relative w-full h-16 flex items-center justify-between sm:px-5 rounded-3xl bg-transparent'>

      <div className="flex gap-10 items-center justify-center">
        <SidebarTrigger />
      </div>

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
