import React from 'react'
import { SelectCard } from './ui/select-card';
import { Input } from './ui/input';
import { IoSearch } from 'react-icons/io5';
import { Button } from './ui/button';
import { StudentAdd } from './student-add';

const StudentHeader = () => {
  return (
    <div className='w-full h-16 flex items-center px-2 gap-10'>
      <div className='relative flex w-full max-w-80 h-fit hover:scale-105 transition-transform duration-200 bg-[#FAF9F6] rounded-lg'>
        <Input placeholder='Search...' />
        <button className='absolute right-3 top-1/2 transform -translate-y-1/2 text-black bg-trasnsparent w-fit h-fit p-1 hover:scale-110 transition-transform duration-200'>
          <IoSearch className='w-5 h-5' />
        </button>
      </div>

      <SelectCard
        placeholder='Year Level'
        options={[
          { value: "freshman", label: "Freshman" },
          { value: "sophomore", label: "Sophomore" },
          { value: "junior", label: "Junior" },
          { value: "senior", label: "Senior" },
        ]}
      />

      <SelectCard
        placeholder='Section'
        options={[
          { value: "section1", label: "Section 1" },
          { value: "section2", label: "Section 2" },
          { value: "section3", label: "Section 3" },
        ]}
      />

        <Button className='bg-blue-500 text-white hover:bg-blue-600 transition-colors duration-200 hover:scale-105'>
            <StudentAdd />
        </Button>
    </div>
  )
}

export { StudentHeader };
