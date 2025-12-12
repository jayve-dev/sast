"use client";

import { ChevronDown, Plus } from "lucide-react";
import { StudentAdd } from "../student-add";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { useState } from "react";

export function StudentHeader() {
  const [open, setOpen] = useState(false);

  return (
    <div className='flex items-center justify-between mb-8'>
      <div>
        <h1 className='text-3xl font-bold text-foreground mb-2'>
          Student Management
        </h1>
        <p className='text-muted-foreground'>
          View and manage all enrolled students
        </p>
      </div>

      <div className='flex items-center gap-3'>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className='gap-2'>
              <Plus className='w-4 h-4' />
              Add Student
            </Button>
          </DialogTrigger>
          <DialogContent className='max-w-2xl max-h-[90vh] overflow-y-auto'>
            <DialogHeader>
              <DialogTitle>Add New Student</DialogTitle>
              <DialogDescription>
                Enter the student's information to add them to the system.
              </DialogDescription>
            </DialogHeader>
            <StudentAdd onSuccess={() => setOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
