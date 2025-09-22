"use client";
import React from "react";
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

export default function Department() {
  return (
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
  );
}
