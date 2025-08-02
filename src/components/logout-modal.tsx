"use client"
import React from 'react'
import { Modal } from './ui/modal';

const LogoutModal = () => {

  // const handleConfirm = () => {
  //   // Handle logout confirmation
  // }

  // const handleCancel = () => {
  //   // Handle logout cancellation
  // }

  return (
    <div>
      <Modal
        // isOpen={true}
        title="Logout"
        description="Are you sure you want to logout?"
        triggerText="Logout"
        // onConfirm={handleConfirm}
        // onCancel={handleCancel}
      />
    </div>
  )
}

export { LogoutModal };
