import React from "react";
import { SelectCard } from "@/components/ui/select-card";
import { Input } from "./ui/input";
import { IoSearch } from "react-icons/io5";
import { Button } from "./ui/button";

const IHeader = () => {
  return (
    <div className='w-full h-16 flex items-center px-2 gap-10'>
      <div className='relative flex w-full max-w-80 h-fit hover:scale-105 transition-transform duration-200 bg-[#FAF9F6] rounded-lg'>
        <Input placeholder='Search...' />
        <button className='absolute right-3 top-1/2 transform -translate-y-1/2 text-black bg-trasnsparent w-fit h-fit p-1 hover:scale-110 transition-transform duration-200'>
          <IoSearch className='w-5 h-5' />
        </button>
      </div>

      <SelectCard
        placeholder='Select a question'
        options={[
          { value: "question1", label: "Question 1" },
          { value: "question2", label: "Question 2" },
          { value: "question3", label: "Question 3" },
        ]}
      />

      <SelectCard
        placeholder='Select a question'
        options={[
          { value: "question1", label: "Question 1" },
          { value: "question2", label: "Question 2" },
          { value: "question3", label: "Question 3" },
        ]}
      />

        <Button className='bg-blue-500 text-white hover:bg-blue-600 transition-colors duration-200 hover:scale-105'>
            Add Instructor
        </Button>
    </div>
  );
};

export { IHeader };
