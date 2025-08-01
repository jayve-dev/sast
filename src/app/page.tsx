import React from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Separator } from '@/components/ui/separator'

// import { SignInForm } from '@/components/ui/auth/SignInForm'

export default function Welcome() {
return (
<div className='w-screen h-screen bg-[#f79b72]'>
    <div className='w-full h-dvh flex flex-row items-center   gap-2'>
        <div className=' bg-red-500 h-dvh  flex flex-col items-center justify-center rounded-r-lg  gap-2  w-full '>
            <h1 className='text-9xl'>SAST</h1>
            <Image src='https://m.media-amazon.com/images/I/51p4o3hNF0L._UF894,1000_QL80_.jpg' alt='logo' width={200}
                height={200} className='rounded-full ' />
            <p className='text-white text-bold'> Hi my name is Jeboy The great welcome to my website</p>
        </div>
        <div className='bg-red-500 w-full h-dvh flex items-center justify-center gap-5'>


            <Link href='/signin'>
            <Button className='text-3xl p-6 hover:scale-110 transition-transform duration-200'>
                Sign in
            </Button>
            </Link>

            <Separator orientation='vertical' className='max-h-[70px] bg-muted' />

            <Link href='/signup'>
            <Button className='text-3xl p-6 hover:scale-110 transition-transform duration-200'>
                Sign up
            </Button>
            </Link>



            <h1>test</h1>
        </div>
    </div>
</div>
)
}
