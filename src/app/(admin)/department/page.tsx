"use client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AddModal } from "@/components/ui/add-modal";
import { ProgramAdd } from "@/components/department/program";
import { SectionAdd } from "@/components/department/section";
import { CourseAdd } from "@/components/department/course";
import { useEffect, useState } from "react";

interface Program {
  id: string;
  name: string;
}

interface Course {
  id: string;
  name: string;
  programId: string;
  sectionId: string;
}

export default function Department() {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);

  useEffect(() => {
    const fetchPrograms = async () => {
      const res = await fetch("/api/create/department/program");
      const data = await res.json();
      setPrograms(data);
    };
    fetchPrograms();
  }, []);

  useEffect(() => {
    const fetchCourses = async () => {
      const res = await fetch("/api/create/department/course");
      const data = await res.json();
      setCourses(data);
    };
    fetchCourses();
  }, []);

  return (
    <div className="w-full flex flex-col gap-2">
      <div>
        <DropdownMenu>
          <DropdownMenuTrigger>ADD</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
              <AddModal triggerText='Add Program' title='Program'>
                <ProgramAdd />
              </AddModal>
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
              <AddModal triggerText='Add Section' title='Section'>
                <SectionAdd />
              </AddModal>
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
              <AddModal triggerText='Add Course' title='Course'>
                <CourseAdd />
              </AddModal>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        <div className="bg-amber-900 w-fit h-fit flex flex-col items-center justify-center p-3 rounded-xl font-bold text-white gap-3">
          <span>PROGRAMS</span>
          {programs.length}
        </div>
        <div className="bg-amber-900 w-fit h-fit flex flex-col items-center justify-center p-3 rounded-xl font-bold text-white gap-3">
          <span>COURSES</span>
          {courses.length}
        </div>
      </div>
    </div>
  );
}
