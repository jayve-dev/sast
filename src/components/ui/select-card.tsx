import React from 'react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface SelectCardProps {
    placeholder?: string;
    options: { value: string; label: string }[];
}

const SelectCard: React.FC<SelectCardProps> = ({ placeholder, options }) => {
  return (
    <div>
      <Select>
        <SelectTrigger className='hover:scale-105 transition-transform duration-200 bg-[#FAF9F6] w-full '>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}

export { SelectCard }