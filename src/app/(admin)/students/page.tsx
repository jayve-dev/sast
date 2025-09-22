"use client";
import { StudentHeader } from "@/components/student-header";
import React, { useEffect, useState } from "react";

interface Program {
  id: string;
  name: string;
}

interface Section {
  id: string;
  name: string;
}

interface Users {
  id: string;
  idNumber: number;
  fullName: string;
  program: Program;
  section: Section;
}

export default function Students() {
  const [users, setUsers] = useState<Users[]>([]);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    const response = await fetch("/api/create/student");
    const data = await response.json();
    setUsers(data);
  };

  // fetchStudents();

  return (
    <div className='w-full h-dvh bg-[#f79b72] rounded-2xl p-3'>
      <StudentHeader />

      <div className="w-full p-6 flex flex-col">
        <div className="flex flex-row items-center justify-between mb-3 border p-5 rounded-md font-bold text-black">
          <h1>ID Number</h1>
          <h1>Full Name</h1>
          <h1>Course</h1>
          <h1>Section</h1>
        </div>
        {users.map((user) => (
            <div key={user.id} className='p-5 flex flex-row items-center justify-between border rounded-xl hover:scale-105 transition-all duration-300 mb-2'>
              <p>{user.idNumber}</p>
              <p>{user.fullName}</p>
              <p>{user.program.name}</p>
              <p>{user.section.name}</p>
            </div>
          ))}
      </div>
    </div>
  );
}
