"use client";
import { IHeader } from "@/components/i-header";
import React, { useState, useEffect } from "react";
import { Ellipsis } from "lucide-react";
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
import { toast } from "sonner";

interface Instructor {
  id: string;
  facultyId: string;
  fullName: string;
}

export default function Instructors() {
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchInstructors();
  }, []);

  const fetchInstructors = async () => {
    try {
      const res = await fetch("/api/create/instructor");
      const data = await res.json();
      setInstructors(data);
    } catch (error) {
      console.error("Failed to fetch instructors:", error);
      toast.error("Failed to load instructors");
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    setIsDeleting(true);
    try {
      const res = await fetch(`/api/create/instructor/${deleteId}`, {
        method: "DELETE",
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.message || "Failed to delete instructor");
      }

      toast.success("Instructor deleted successfully");

      setInstructors(instructors.filter((i) => i.id !== deleteId));
      setDeleteId(null);
    } catch (error) {
      console.error("Delete error:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to delete instructor";
      toast.error(errorMessage);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className='w-full h-dvh bg-[#f79b72] rounded-2xl p-3'>
      <IHeader />

      <div className=''>
        <div className='flex flex-row items-center justify-between mb-3 border p-5 rounded-md font-bold text-black'>
          <div>#</div>
          <div>Faculty ID</div>
          <div>Name</div>
        </div>
        <div>
          {instructors.map((instructor, index) => (
            <div
              key={instructor.id}
              className='p-5 flex flex-row items-center justify-between border rounded-xl hover:scale-105 transition-all duration-300 mb-2'
            >
              <div className='w-full flex flex-row items-center justify-between'>
                <div>{index + 1}</div>
                <div>{instructor.facultyId}</div>
                <div>{instructor.fullName}</div>
              </div>
              <div className='pl-2'>
                <DropdownMenu>
                  <DropdownMenuTrigger onClick={(e) => e.preventDefault()}>
                    <Ellipsis />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuLabel>Action</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>Edit</DropdownMenuItem>
                    <DropdownMenuItem
                      className='text-red-600'
                      onClick={(e) => {setDeleteId(instructor.id); e.preventDefault();}}
                    >
                      Delete
                    </DropdownMenuItem>
                    <DropdownMenuItem>View Details</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          ))}
        </div>
      </div>

      <AlertDialog
        open={deleteId !== null}
        onOpenChange={() => setDeleteId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              instructor and all associated teaching assignments.
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
    </div>
  );
}
