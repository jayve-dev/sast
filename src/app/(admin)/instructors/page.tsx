"use client";
import { IHeader } from "@/components/i-header";
import React, { useState, useEffect} from "react";

interface Instructor {
  id: string;
  facultyId: string;
  fullName: string;
}

export default function Instructors() {
  const [instructors, setInstructors] = useState<Instructor[]>([]);

  useEffect(() => {
    const fetchInstructors = async () => {
      const res = await fetch("/api/create/instructor");
      const data = await res.json();
      setInstructors(data);
    };
    fetchInstructors();
  }, []);

  return (
    <div className='w-full h-dvh bg-[#f79b72] rounded-2xl p-3'>
      <IHeader />

      {/* <div>
        {instructors.length}
      </div> */}

      <div className="">
        <div className="flex flex-row items-center justify-between mb-3 border p-5 rounded-md font-bold text-black">
          <div>#</div>
          <div>Faculty ID</div>
          <div>Name</div>
        </div>
        <div>
          {instructors.map((instructor, index) => (
            <div key={instructor.id} className="p-5 flex flex-row items-center justify-between border rounded-xl hover:scale-105 transition-all duration-300 mb-2">
              <div>{index + 1}</div>
              <div>{instructor.facultyId}</div>
              <div>{instructor.fullName}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
