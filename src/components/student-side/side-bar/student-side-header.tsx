"use client";
import React, { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { RoleLabel } from "@/components/role-label";
import { LogoutModal } from "@/components/logout-modal";
import { Button } from "@/components/ui/button";

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  const handleOpenDropdown = () => {
    setIsOpen(!isOpen);
  };

  const handleAccountClick = () => {
    router.push("/account");
    setIsOpen(false);
  };

  return (
    <div className='relative w-full h-16 flex items-center justify-between sm:px-5 rounded-3xl bg-transparent'>
      <div className='flex gap-10 items-center justify-center'></div>

      <div className='flex items-center justify-center gap-3'>
        <RoleLabel />
        <button onClick={handleOpenDropdown} className='relative'>
          <Image
            width={0}
            height={0}
            src='/profileIcon.svg'
            alt='profile icon'
            className='w-12 h-12 rounded-full hover:scale-110 transition-transform duration-200'
          />
        </button>
        {isOpen && (
          <div className='absolute top-15 right-1 z-50'>
            <div className='w-40 bg-white rounded-lg shadow-lg p-3 flex flex-col items-center gap-5'>
              <Button onClick={handleAccountClick} className='w-full'>
                Account
              </Button>
              <LogoutModal className='w-full' />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export { Header };
