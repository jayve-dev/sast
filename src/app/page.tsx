import React from 'react'
// import Image from 'next/image'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Separator } from '@/components/ui/separator'

// import { SignInForm } from '@/components/ui/auth/SignInForm'

export default function Welcome() {
return (
<div className='w-screen min-h-screen bg-[#FFFFF0] '>
    <div className='w-full h-dvh flex flex-row items-center  gap-2'>
        <div
            className=' bg-gray-200 shadow-gray-900 shadow-4xl h-dvh sm:flex   hidden flex-col items-center justify-center rounded-r-lg  gap-2  w-full '>
            <h1 className=''>SAST</h1>

        </div>


        <div className=' w-full h-dvh flex flex-col items-center justify-center gap-5'>


            <div className=' p-4 flex bg-gray-200 rounded-2xl  gap-2'>
                <Link href='/signin'>
                <Button className='text-3xl p-6 hover:scale-110 transition-transform duration-200'>
                    Sign in
                </Button>
                </Link>
                <Separator orientation='vertical' className='max-h-[70px] bg-muted bg-gray-500' />
                <Link href='/signup'>
                <Button className='text-3xl p-6 hover:scale-110 transition-transform duration-200'>
                    Sign up
                </Button>
                </Link>
            </div>

        </div>
    </div>
</div>
)
}
