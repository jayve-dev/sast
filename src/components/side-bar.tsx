"use client"
import React from 'react'
import { Button } from './ui/button'

const SideBar = () => {
  return (
    <div className='w-auto h-full max-h-[500px] bg-[#f79b72] p-7 rounded-lg shadow-lg shadow-[#0A0A0A]/50'>
      <div className='w-full h-full flex flex-col items-center justify-center gap-4'>
        <Button>Home</Button>
        <Button>Home</Button>
        <Button>Home</Button>
        <Button>Home</Button>
        <Button>Home</Button>
        <Button>Home</Button>
      </div>
    
      
    </div>
  )
}

export { SideBar}
