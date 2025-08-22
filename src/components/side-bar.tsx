"use client";
import React from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { FaArrowRightFromBracket } from "react-icons/fa6";
import { LogoutModal } from "./logout-modal";

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

const SideBar = () => {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <div className='h-full hidden sm:flex items-center mr-5 ml-8'>
      <div
        className={`relative w-auto h-full ${
          isOpen
            ? "bg-[#f79b72] max-h-[500px] px-9 p-5 rounded-lg shadow-lg shadow-[#0A0A0A]/50 transition-all duration-400"
            : "bg-transparent transition-all duration-400 max-h-[500px]"
        }`}
      >
        <button
          className='absolute border-8 border-[#2A4759] rounded-full p-3 h-16 w-16 flex items-center justify-center bg-[#f79b72] z-10 -left-9 bottom-[225px] hover:scale-105 transition-transform duration-200 '
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? (
            <FaArrowRightFromBracket className='-rotate-180 transform transition-transform duration-500' />
          ) : (
            <FaArrowRightFromBracket className='transform transition-transform duration-500' />
          )}
        </button>
        <div className='w-full h-full flex flex-col items-center justify-between gap-4'>
          {isOpen && (
            <>
              <div className='flex flex-col items-center justify-center gap-7 w-fit'>
                <NavbarItem href='/dashboard'>Home</NavbarItem>
                <NavbarItem href='/department'>Department</NavbarItem>
                <NavbarItem href='/questionnaire'>Questionnaire</NavbarItem>
                <NavbarItem href='/instructors'>Instructors</NavbarItem>
                <NavbarItem href='/students'>Students</NavbarItem>
                <NavbarItem href='/reports'>Reports</NavbarItem>
                <NavbarItem href='/adminregister'>Accounts</NavbarItem>
              </div>
              <div className='shadow-lg shadow-[#0A0A0A]/50 p-2 rounded-lg w-full flex items-center justify-center hover:scale-105 transition-transform duration-200 bg-[#2A4759]'>
                <LogoutModal />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export { SideBar };
