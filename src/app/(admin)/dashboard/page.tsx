import React from 'react'

export default function Dashboard() {
  return (
    <div className='w-full h-full flex flex-1 p-5'>
      <div className='w-full h-full grid [grid-template-columns:repeat(auto-fit,minmax(150px,1fr))]
      md:grid-cols-3 gap-3'>
        <div className='w-full h-full bg-[#5B5151] flex items-center justify-center p-10 rounded-2xl'>1</div>
        <div className='w-full h-full bg-[#5B5151] flex items-center justify-center p-10 rounded-2xl'>2</div>
        <div className='w-full h-full bg-[#5B5151] flex items-center justify-center p-10 rounded-2xl'>3</div>
        <div className='w-full h-full bg-[#5B5151] flex items-center justify-center p-10 rounded-2xl col-span-full'>4</div>
      </div>
    </div>
  )
}
