"use client"
import React from 'react'
import { Modal } from './ui/modal';
import { signOut } from 'next-auth/react';

const LogoutModal = () => {

  const handleConfirm = async () => {
    await signOut();
  }

  return (
    <div>
      <Modal
        title="Log out"
        description="Are you sure you want to logout?"
        triggerText="Log out"
        onConfirm={handleConfirm}
      />
    </div>
  )
}

export { LogoutModal };
