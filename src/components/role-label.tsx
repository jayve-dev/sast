"use client"
import React from 'react'
import { useSession } from 'next-auth/react'

const RoleLabel = () => {

  const { data: session } = useSession()

  return (
    <div className='text-gray-300 text-xl font-bold'>
      {session?.user?.role}
    </div>
  )
}

export { RoleLabel }
