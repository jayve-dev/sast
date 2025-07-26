import React from 'react'
import { AddModal } from './ui/add-modal'

const InstructorAdd = () => {
  return (
    <div>
      <AddModal
        title="Add Instructor"
        description="Fill in the details to add a new instructor."
        triggerText="Add Instructor"
      />
    </div>
  )
}

export { InstructorAdd }


