import React from 'react'
import { AddModal } from './ui/add-modal'

const StudentAdd = () => {
  return (
    <div>
      <AddModal
        title="Add Student"
        description="Fill in the details to add a new student."
        triggerText="Add Student"
      />
    </div>
  )
}

export { StudentAdd }
