import StudentsPageHeader from '@/components/student/studentsPageHeader'
import React from 'react'


export default function page() {
return (
<>
    <StudentsPageHeader />
    <div className='flex flex-col gap-4 p-10   h-dvh'>


        <div
            className='bg-red-200 flex items-center justify-center-safe max-w-fit w-full  mx-auto mt-8 rounded-2xl max-h-[200px]  h-dvh'>
            <h1 className=' text-2xl text-center  font-bold mt-4'>Student Survey</h1>
        </div>
    </div>
</>
)
}
