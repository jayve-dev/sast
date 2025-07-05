"use client";
import React from 'react'

interface AuthHeaderProps {
    label: string;
    title: string;
    }

const AuthHeader = ({label, title}: AuthHeaderProps) => {
  return (
    <div>
        <h1 className='text-4xl font-bold text-center'>{title}</h1>
        <p className='text-sm text-gray-600 text-center'>{label}</p>  
    </div>
  )
}

export default AuthHeader
