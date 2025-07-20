import React from 'react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function Welcome() {
  return (
    <div className='w-screen h-screen bg-[#f79b72]'>
        <div className='w-full h-dvh flex flex-col items-center justify-center gap-5'>
            <h1 className='text-9xl'>SAST</h1>
            <div className='flex gap-5'>
                <Link href='/signin'>
                    <Button className='text-3xl p-6 hover:scale-110 transition-transform duration-200'>Sign in</Button>
                </Link>
                <Link href='/signup'>
                    <Button className='text-3xl p-6 hover:scale-110 transition-transform duration-200'>Sign up</Button>
                </Link>
            </div>
        </div>
    </div>
  )
}
