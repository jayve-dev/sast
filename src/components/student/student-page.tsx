"use client";
import { StudentHeader } from "./student-header";
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
import {
  MoreHorizontal,
  Trash2,
  Edit,
  Search,
  Filter,
  X,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { toast } from "sonner";

interface Program {
  id: string;
  name: string;
}
interface Student {
  id: string;
  idNumber: number;
  fullName: string;
  program: Program;
  programId: string;
}

const ITEMS_PER_PAGE = 15;

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Search and filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProgram, setSelectedProgram] = useState<string>("all");

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);

  const [editStudent, setEditStudent] = useState<Student | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editFormData, setEditFormData] = useState({
    idNumber: "",
    fullName: "",
    programId: "",
    password: "",
  });

  useEffect(() => {
    fetchStudents();
    fetchPrograms();
  }, []);

  // Apply filters whenever search term, selected program, or students change
  useEffect(() => {
    applyFilters();
    setCurrentPage(1); // Reset to first page when filters change
  }, [searchTerm, selectedProgram, students]);

  const fetchStudents = async () => {
    try {
      const response = await fetch("/api/create/student");
      const data = await response.json();
      setStudents(data);
      setFilteredStudents(data);
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

  const applyFilters = () => {
    let filtered = [...students];

    // Search filter (by ID number or name)
    if (searchTerm) {
      filtered = filtered.filter(
        (student) =>
          student.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          student.idNumber.toString().includes(searchTerm)
      );
    }

    // Program filter
    if (selectedProgram && selectedProgram !== "all") {
      filtered = filtered.filter(
        (student) => student.programId === selectedProgram
      );
    }

    setFilteredStudents(filtered);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedProgram("all");
  };

  const hasActiveFilters = searchTerm !== "" || selectedProgram !== "all";

  // Pagination calculations
  const totalPages = Math.ceil(filteredStudents.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentStudents = filteredStudents.slice(startIndex, endIndex);

  const goToFirstPage = () => setCurrentPage(1);
  const goToLastPage = () => setCurrentPage(totalPages);
  const goToNextPage = () =>
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  const goToPreviousPage = () =>
    setCurrentPage((prev) => Math.max(prev - 1, 1));

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

      // Adjust current page if needed
      const newFilteredLength = filteredStudents.length - 1;
      const newTotalPages = Math.ceil(newFilteredLength / ITEMS_PER_PAGE);
      if (currentPage > newTotalPages && newTotalPages > 0) {
        setCurrentPage(newTotalPages);
      }
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
        password?: string;
      } = {
        idNumber: Number(editFormData.idNumber),
        fullName: editFormData.fullName,
        programId: editFormData.programId,
      };

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

      const updatedProgram = programs.find((p) => p.id === payload.programId);

      setStudents(
        students.map((student) =>
          student.id === editStudent.id
            ? {
                ...student,
                idNumber: payload.idNumber,
                fullName: payload.fullName,
                programId: payload.programId,
                program: updatedProgram || student.program,
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
    <div className='min-h-screen w-full bg-background p-2 text-black'>
      <StudentHeader />

      {/* Search and Filter Section */}
      <div className='mb-6 space-y-4'>
        {/* Search and Filter Controls */}
        <div className='bg-card border border-border rounded-lg p-4'>
          <div className='flex flex-col md:flex-row gap-4 items-end'>
            {/* Search Input */}
            <div className='flex-1 space-y-2'>
              <Label htmlFor='search' className='text-sm font-medium'>
                Search Students
              </Label>
              <div className='relative'>
                <Search className='absolute left-3 top-3 h-4 w-4 text-muted-foreground' />
                <Input
                  id='search'
                  placeholder='Search by name or ID number...'
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className='pl-9'
                />
              </div>
            </div>

            {/* Program Filter */}
            <div className='flex-1 space-y-2'>
              <Label htmlFor='program-filter' className='text-sm font-medium'>
                Filter by Program
              </Label>
              <Select
                value={selectedProgram}
                onValueChange={setSelectedProgram}
              >
                <SelectTrigger id='program-filter'>
                  <SelectValue placeholder='All Programs' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='all'>All Programs</SelectItem>
                  {programs.map((program) => (
                    <SelectItem key={program.id} value={program.id}>
                      {program.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className='bg-card border border-border rounded-lg p-2 flex flex-row justify-center items-center gap-2'>
              <p className='text-sm text-muted-foreground'>Total Students:</p>
              <p className='text-2xl font-bold text-foreground'>
                {students.length}
              </p>
            </div>

            <div className='bg-card border border-border rounded-lg p-2 flex flex-row justify-center items-center gap-2'>
              <p className='text-sm text-muted-foreground'>Showing:</p>
              <p className='text-2xl font-bold text-foreground'>
                {filteredStudents.length}
              </p>
            </div>
          </div>

          {/* Active Filters Display */}
          {hasActiveFilters && (
            <div className='mt-4 flex flex-wrap gap-2 items-center'>
              <span className='text-sm text-muted-foreground flex items-center gap-1'>
                <Filter className='w-4 h-4' />
                Active filters:
              </span>
              {searchTerm && (
                <div className='inline-flex items-center gap-1 px-2 py-1 bg-secondary rounded-md text-sm'>
                  <span className='text-muted-foreground'>Search:</span>
                  <span className='font-medium'>{searchTerm}</span>
                  <button
                    onClick={() => setSearchTerm("")}
                    className='ml-1 hover:bg-secondary-foreground/10 rounded-full p-0.5'
                  >
                    <X className='w-3 h-3' />
                  </button>
                </div>
              )}
              {selectedProgram !== "all" && (
                <div className='inline-flex items-center gap-1 px-2 py-1 bg-secondary rounded-md text-sm'>
                  <span className='text-muted-foreground'>Program:</span>
                  <span className='font-medium'>
                    {programs.find((p) => p.id === selectedProgram)?.name}
                  </span>
                  <button
                    onClick={() => setSelectedProgram("all")}
                    className='ml-1 hover:bg-secondary-foreground/10 rounded-full p-0.5'
                  >
                    <X className='w-3 h-3' />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Students Table */}
      <div className='rounded-xl border border-border bg-card overflow-hidden shadow-sm'>
        <div className='grid grid-cols-4 gap-4 px-6 py-4 bg-secondary/50 border-b border-border font-semibold text-sm text-foreground'>
          <div>ID Number</div>
          <div>Full Name</div>
          <div>Program</div>
          <div className='text-right'>Actions</div>
        </div>

        {/* Table Body */}
        <div className='divide-y divide-border'>
          {currentStudents.length === 0 ? (
            <div className='px-6 py-12 text-center'>
              <p className='text-muted-foreground mb-2'>
                {hasActiveFilters
                  ? "No students found matching your filters"
                  : "No students found"}
              </p>
              {hasActiveFilters && (
                <Button
                  variant='outline'
                  size='sm'
                  onClick={clearFilters}
                  className='gap-2'
                >
                  <X className='w-4 h-4' />
                  Clear Filters
                </Button>
              )}
            </div>
          ) : (
            currentStudents.map((student, index) => (
              <div
                key={student.id}
                className='grid grid-cols-4 gap-4 px-6 py-4 items-center hover:bg-secondary/30 transition-colors'
              >
                <div className='flex items-center gap-3'>
                  <span className='text-xs text-muted-foreground w-6'>
                    {startIndex + index + 1}
                  </span>
                  <span className='font-medium text-foreground'>
                    {student.idNumber}
                  </span>
                </div>
                <div className='text-foreground'>{student.fullName}</div>
                <div className='text-sm text-muted-foreground'>
                  {student.program.name}
                </div>
                <div className='flex justify-end'>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className='inline-flex items-center justify-center w-8 h-8 rounded-md hover:bg-secondary transition-colors'>
                        <MoreHorizontal className='w-4 h-4 text-muted-foreground' />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align='end' className='w-48'>
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => handleEditClick(student)}
                        className='cursor-pointer flex items-center gap-2'
                      >
                        <Edit className='w-4 h-4' />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => setDeleteId(student.id)}
                        className='cursor-pointer flex items-center gap-2 text-destructive'
                      >
                        <Trash2 className='w-4 h-4' />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pagination */}
        {filteredStudents.length > 0 && (
          <div className='px-6 py-4 border-t border-border bg-secondary/20'>
            <div className='flex items-center justify-between'>
              <div className='text-sm text-muted-foreground'>
                <span className='font-medium text-foreground'>
                  {startIndex + 1}
                </span>{" "}
              </div>

              <div className='flex items-center gap-2'>
                {/* Previous Page */}
                <Button
                  variant='outline'
                  size='sm'
                  onClick={goToPreviousPage}
                  disabled={currentPage === 1}
                  className='h-8 w-8 p-0'
                >
                  <ChevronLeft className='h-4 w-4' />
                </Button>

                {/* Page Numbers */}
                <div className='flex items-center gap-1'>
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter((page) => {
                      // Show first page, last page, current page, and adjacent pages
                      return (
                        page === 1 ||
                        page === totalPages ||
                        Math.abs(page - currentPage) <= 1
                      );
                    })
                    .map((page, index, array) => (
                      <React.Fragment key={page}>
                        {index > 0 && array[index - 1] !== page - 1 && (
                          <span className='px-2 text-muted-foreground'>
                            ...
                          </span>
                        )}
                        <Button
                          variant={currentPage === page ? "default" : "outline"}
                          size='sm'
                          onClick={() => setCurrentPage(page)}
                          className='h-8 w-8 p-0'
                        >
                          {page}
                        </Button>
                      </React.Fragment>
                    ))}
                </div>

                {/* Next Page */}
                <Button
                  variant='outline'
                  size='sm'
                  onClick={goToNextPage}
                  disabled={currentPage === totalPages}
                  className='h-8 w-8 p-0'
                >
                  <ChevronRight className='h-4 w-4' />
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={deleteId !== null}
        onOpenChange={() => setDeleteId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Student</AlertDialogTitle>
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
              className='bg-destructive hover:bg-destructive/90 text-destructive-foreground'
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
              Update student information below.
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
