import React from 'react'
import { Button } from '../ui/button'

interface SurveyHeaderProps {
  addSurvey?: () => void
}

const SurveyHeader = ({ addSurvey }: SurveyHeaderProps) => {
  return (
    <div className='w-full h-16 flex items-center justify-between p-2 border rounded-xl border-gray-300 mb-4'>
      <h1>Survey Questionnaire</h1>
      <Button variant='outline' className='ml-4' onClick={addSurvey}>
        Create Survey
      </Button>
    </div>
  )
}

export { SurveyHeader }
