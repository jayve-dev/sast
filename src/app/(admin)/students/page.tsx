"use client";
import { StudentHeader } from "@/components/student-header";
import React, { useEffect, useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Ellipsis } from "lucide-react";
import { toast } from "sonner";

interface Program {
  id: string;
  name: string;
}

interface Section {
  id: string;
  name: string;
}

interface Student {
  id: string;
  idNumber: number;
  fullName: string;
  program: Program;
  section: Section;
  programId: string;
  sectionId: string;
}

export default function Students() {
  const [students, setStudents] = useState<Student[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Edit states
  const [editStudent, setEditStudent] = useState<Student | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editFormData, setEditFormData] = useState({
    idNumber: "",
    fullName: "",
    programId: "",
    sectionId: "",
    password: "",
  });

  useEffect(() => {
    fetchStudents();
    fetchPrograms();
    fetchSections();
  }, []);

  const fetchStudents = async () => {
    try {
      const response = await fetch("/api/create/student");
      const data = await response.json();
      setStudents(data);
    } catch (error) {
      console.error("Failed to fetch students:", error);
      toast.error("Failed to load students");
    }
  };

  const fetchPrograms = async () => {
    try {
      const response = await fetch("/api/create/department/program");
      const data = await response.json();
      setPrograms(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to fetch programs:", error);
    }
  };

  const fetchSections = async () => {
    try {
      const response = await fetch("/api/create/department/section");
      const data = await response.json();
      setSections(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to fetch sections:", error);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    setIsDeleting(true);
    try {
      const res = await fetch(`/api/create/student/${deleteId}`, {
        method: "DELETE",
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.message || "Failed to delete student");
      }

      toast.success("Student deleted successfully");
      setStudents(students.filter((student) => student.id !== deleteId));
      setDeleteId(null);
    } catch (error) {
      console.error("Delete error:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to delete student";
      toast.error(errorMessage);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleEditClick = (student: Student) => {
    setEditStudent(student);
    setEditFormData({
      idNumber: student.idNumber.toString(),
      fullName: student.fullName,
      programId: student.programId,
      sectionId: student.sectionId,
      password: "",
    });
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editStudent) return;

    setIsEditing(true);
    try {
      const payload: {
        idNumber: number;
        fullName: string;
        programId: string;
        sectionId: string;
        password?: string;
      } = {
        idNumber: Number(editFormData.idNumber),
        fullName: editFormData.fullName,
        programId: editFormData.programId,
        sectionId: editFormData.sectionId,
      };

      // Only include password if it's not empty
      if (editFormData.password.trim()) {
        payload.password = editFormData.password;
      }

      const res = await fetch(`/api/create/student/${editStudent.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.message || "Failed to update student");
      }

      toast.success("Student updated successfully");

      // Update local state
      const updatedProgram = programs.find((p) => p.id === payload.programId);
      const updatedSection = sections.find((s) => s.id === payload.sectionId);

      setStudents(
        students.map((student) =>
          student.id === editStudent.id
            ? {
                ...student,
                idNumber: payload.idNumber,
                fullName: payload.fullName,
                programId: payload.programId,
                sectionId: payload.sectionId,
                program: updatedProgram || student.program,
                section: updatedSection || student.section,
              }
            : student
        )
      );

      setEditStudent(null);
    } catch (error) {
      console.error("Update error:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to update student";
      toast.error(errorMessage);
    } finally {
      setIsEditing(false);
    }
  };

  return (
    <div className='w-full h-dvh bg-[#f79b72] rounded-2xl p-3'>
      <StudentHeader />

      <div className='w-full p-6 flex flex-col'>
        <div className='flex flex-row items-center justify-between mb-3 border p-5 rounded-md font-bold text-black'>
          <h1>ID Number</h1>
          <h1>Full Name</h1>
          <h1>Course</h1>
          <h1>Section</h1>
        </div>
        {students.map((student) => (
          <div
            key={student.id}
            className='p-5 flex flex-row items-center justify-between border rounded-xl hover:scale-105 transition-all duration-300 mb-2'
          >
            <div className='w-full flex flex-row items-center justify-between'>
              <p>{student.idNumber}</p>
              <p>{student.fullName}</p>
              <p>{student.program.name}</p>
              <p>{student.section.name}</p>
            </div>
            <div>
              <DropdownMenu>
                <DropdownMenuTrigger onClick={(e) => e.preventDefault()}>
                  <Ellipsis />
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuLabel>Action</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => handleEditClick(student)}>
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className='text-red-600'
                    onClick={(e) => {
                      setDeleteId(student.id);
                      e.preventDefault();
                    }}
                  >
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        ))}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={deleteId !== null}
        onOpenChange={() => setDeleteId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              student and their associated user account.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className='bg-red-600 hover:bg-red-700'
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit Dialog */}
      <Dialog
        open={editStudent !== null}
        onOpenChange={() => setEditStudent(null)}
      >
        <DialogContent className='max-w-md'>
          <DialogHeader>
            <DialogTitle>Edit Student</DialogTitle>
            <DialogDescription>
              Update student information. Leave password blank to keep current
              password.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditSubmit}>
            <div className='space-y-4 py-4'>
              <div className='space-y-2'>
                <Label htmlFor='edit-idNumber'>ID Number</Label>
                <Input
                  id='edit-idNumber'
                  type='number'
                  value={editFormData.idNumber}
                  onChange={(e) =>
                    setEditFormData({
                      ...editFormData,
                      idNumber: e.target.value,
                    })
                  }
                  required
                />
              </div>

              <div className='space-y-2'>
                <Label htmlFor='edit-fullName'>Full Name</Label>
                <Input
                  id='edit-fullName'
                  value={editFormData.fullName}
                  onChange={(e) =>
                    setEditFormData({
                      ...editFormData,
                      fullName: e.target.value,
                    })
                  }
                  required
                />
              </div>

              <div className='space-y-2'>
                <Label htmlFor='edit-program'>Program</Label>
                <Select
                  value={editFormData.programId}
                  onValueChange={(value) =>
                    setEditFormData({ ...editFormData, programId: value })
                  }
                >
                  <SelectTrigger id='edit-program'>
                    <SelectValue placeholder='Select program' />
                  </SelectTrigger>
                  <SelectContent>
                    {programs.map((program) => (
                      <SelectItem key={program.id} value={program.id}>
                        {program.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className='space-y-2'>
                <Label htmlFor='edit-section'>Section</Label>
                <Select
                  value={editFormData.sectionId}
                  onValueChange={(value) =>
                    setEditFormData({ ...editFormData, sectionId: value })
                  }
                >
                  <SelectTrigger id='edit-section'>
                    <SelectValue placeholder='Select section' />
                  </SelectTrigger>
                  <SelectContent>
                    {sections.map((section) => (
                      <SelectItem key={section.id} value={section.id}>
                        {section.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* <div className='space-y-2'>
                <Label htmlFor='edit-password'>New Password (optional)</Label>
                <Input
                  id='edit-password'
                  type='password'
                  value={editFormData.password}
                  onChange={(e) =>
                    setEditFormData({
                      ...editFormData,
                      password: e.target.value,
                    })
                  }
                  placeholder='Leave blank to keep current password'
                />
              </div> */}
            </div>
            <DialogFooter>
              <Button
                type='button'
                variant='outline'
                onClick={() => setEditStudent(null)}
                disabled={isEditing}
              >
                Cancel
              </Button>
              <Button type='submit' disabled={isEditing}>
                {isEditing ? "Updating..." : "Update"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
