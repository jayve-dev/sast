"use client";
import React from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Input } from "./ui/input";
import { IoSearch } from "react-icons/io5";

interface NavbarItem {
  href: string;
}

const NavbarItem: React.FC<React.PropsWithChildren<NavbarItem>> = ({
  children,
  href,
}) => {
  const pathname = usePathname();
  const isActive = pathname === href;
  return (
    <Link
      href={href}
      className={cn(
        "shadow-lg shadow-[#0A0A0A]/50 p-2 rounded-lg w-full flex items-center justify-center hover:scale-105 transition-transform duration-200 bg-[#2A4759]",
        isActive && "underline"
      )}
    >
      {children}
    </Link>
  );
};

const NavBar = () => {
  return (
    <>
      <div
        className={`sm:hidden absolute w-auto h-fit bg-[#f79b72] pl-12 p-5 rounded-lg shadow-lg shadow-[#0A0A0A]/50 transition-all duration-400 z-10 left-6 -bottom-[475px]`}
      >
        <div className='w-full h-full flex flex-col items-center justify-between gap-8'>
          {/* search */}
          <div className='relative sm:hidden w-fit h-fit hover:scale-105 transition-transform duration-200'>
            <Input placeholder='Search...' />
            <button className='absolute right-3 top-1/2 transform -translate-y-1/2 text-black bg-trasnsparent w-fit h-fit p-1 hover:scale-110 transition-transform duration-200'>
              <IoSearch className='w-5 h-5' />
            </button>
          </div>
          <div className='flex flex-col items-center justify-center gap-7 w-full'>
            <NavbarItem href='/dashboard'>Home</NavbarItem>
            <NavbarItem href='/questionnaire'>Questionnaire</NavbarItem>
            <NavbarItem href='/instructors'>Instructors</NavbarItem>
            <NavbarItem href='/students'>Students</NavbarItem>
            <NavbarItem href='/reports'>Reports</NavbarItem>
          </div>
          <div className='w-full mt-8'>
            <NavbarItem href='/ambot'>Log out</NavbarItem>
          </div>
        </div>
      </div>
    </>
  );
};

export { NavBar };
