"use client";
import type React from "react";
import { useEffect, useState } from "react";
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
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { MoreHorizontal, Trash2, Edit, BookOpen, Plus, X } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

interface Course {
  id: string;
  code: string;
  name: string;
}

interface Section {
  id: string;
  name: string;
}

interface Program {
  id: string;
  name: string;
}

interface Assignment {
  id: string;
  Course: Course;
  Section: Section;
  Program: Program;
  programId: string;
  courseId: string;
  sectionId: string;
}

interface Instructor {
  id: string;
  facultyId: string;
  fullName: string;
  assigns: Assignment[];
}

type EditAssignment = {
  id: string;
  programId: string;
  courseId: string;
  sectionId: string;
  isNew?: boolean;
};

export default function InstructorsPage() {
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [editInstructor, setEditInstructor] = useState<Instructor | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editFormData, setEditFormData] = useState({
    facultyId: "",
    fullName: "",
  });
  const [editAssignments, setEditAssignments] = useState<EditAssignment[]>([]);

  // Data for dropdowns
  const [programs, setPrograms] = useState<Program[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [sections, setSections] = useState<Section[]>([]);

  useEffect(() => {
    fetchInstructors();
    fetchDropdownData();
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

  const fetchDropdownData = async () => {
    try {
      const [programsRes, coursesRes, sectionsRes] = await Promise.all([
        fetch("/api/create/department/program"),
        fetch("/api/create/department/course"),
        fetch("/api/create/department/section"),
      ]);

      const programsData = await programsRes.json();
      const coursesData = await coursesRes.json();
      const sectionsData = await sectionsRes.json();

      setPrograms(Array.isArray(programsData) ? programsData : []);
      setCourses(Array.isArray(coursesData) ? coursesData : []);
      setSections(Array.isArray(sectionsData) ? sectionsData : []);
    } catch (error) {
      console.error("Failed to fetch dropdown data:", error);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    console.log("Attempting to delete instructor with ID:", deleteId);

    setIsDeleting(true);
    try {
      const url = `/api/create/instructor/${deleteId}`;
      console.log("DELETE request URL:", url);

      const res = await fetch(url, {
        method: "DELETE",
      });

      console.log("Response status:", res.status);

      const result = await res.json();
      console.log("Response data:", result);

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

  const handleEditClick = (instructor: Instructor) => {
    setEditInstructor(instructor);
    setEditFormData({
      facultyId: instructor.facultyId,
      fullName: instructor.fullName,
    });

    // Convert existing assignments to edit format
    const assignments = instructor.assigns.map((assign) => ({
      id: assign.id,
      programId: assign.programId,
      courseId: assign.courseId,
      sectionId: assign.sectionId,
      isNew: false,
    }));

    setEditAssignments(
      assignments.length > 0
        ? assignments
        : [
            {
              id: "new-1",
              programId: "",
              courseId: "",
              sectionId: "",
              isNew: true,
            },
          ]
    );
  };

  const addEditAssignment = () => {
    const newId = `new-${Date.now()}`;
    setEditAssignments([
      ...editAssignments,
      { id: newId, programId: "", courseId: "", sectionId: "", isNew: true },
    ]);
  };

  const removeEditAssignment = (id: string) => {
    if (editAssignments.length > 1) {
      setEditAssignments(editAssignments.filter((a) => a.id !== id));
    }
  };

  const updateEditAssignment = (
  id: string,
  field: "programId" | "courseId" | "sectionId",
  value: string
) => {
  setEditAssignments(
    editAssignments.map((assign) =>
      assign.id === id ? { ...assign, [field]: value } : assign
    )
  );
};

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editInstructor) return;

    // Validate all assignments have required fields
    const invalidAssignments = editAssignments.filter(
      (a) => !a.programId || !a.courseId || !a.sectionId
    );

    if (invalidAssignments.length > 0) {
      toast.error("Please fill in all assignment fields");
      return;
    }

    setIsEditing(true);
    try {
      const payload = {
        facultyId: editFormData.facultyId,
        fullName: editFormData.fullName,
        assignments: editAssignments.map((a) => ({
          programId: a.programId,
          courseId: a.courseId,
          sectionId: a.sectionId,
        })),
      };

      const res = await fetch(`/api/create/instructor/${editInstructor.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.message || "Failed to update instructor");
      }

      toast.success("Instructor updated successfully");

      // Refresh instructors list
      await fetchInstructors();

      setEditInstructor(null);
      setEditAssignments([]);
    } catch (error) {
      console.error("Update error:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to update instructor";
      toast.error(errorMessage);
    } finally {
      setIsEditing(false);
    }
  };

  return (
    <div className='min-h-screen w-full bg-background p-2'>
      <div className='flex flex-row justify-between items-center mb-4'>
        <div>
          <h1 className='text-3xl font-bold text-foreground'>Instructors</h1>
          <p className='text-muted-foreground mt-2'>
            Manage faculty members and instructors
          </p>
        </div>
        <Link href='/instructors/add-instructor'>   
            <Button>Add Instructor </Button>    
        </Link>
      </div>

      <div className='rounded-xl border border-border bg-card overflow-hidden shadow-sm'>
        {/* Table Header */}
        <div className='grid grid-cols-4 gap-4 px-6 py-4 bg-secondary/50 border-b border-border font-semibold text-sm text-foreground'>
          <div>Faculty ID</div>
          <div>Full Name</div>
          <div>Teaching Assignments</div>
          <div className='text-right'>Actions</div>
        </div>

        {/* Table Body */}
        <div className='divide-y divide-border'>
          {instructors.length === 0 ? (
            <div className='px-6 py-12 text-center text-muted-foreground'>
              No instructors found
            </div>
          ) : (
            instructors.map((instructor) => (
              <div
                key={instructor.id}
                className='grid grid-cols-4 gap-4 px-6 py-4 items-center hover:bg-secondary/30 transition-colors'
              >
                <div className='font-medium text-foreground'>
                  {instructor.facultyId}
                </div>
                <div className='text-foreground'>{instructor.fullName}</div>
                <div className='space-y-2'>
                  {instructor.assigns && instructor.assigns.length > 0 ? (
                    <div className='flex flex-wrap gap-2'>
                      {instructor.assigns.map((assignment) => (
                        <div
                          key={assignment.id}
                          className='flex flex-col gap-1'
                        >
                          <Badge variant='outline' className='text-xs'>
                            <BookOpen className='w-3 h-3 mr-1' />
                            {assignment.Course.code}
                          </Badge>
                          <span className='text-xs text-muted-foreground'>
                            {assignment.Program.name} -{" "}
                            {assignment.Section.name}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <span className='text-sm text-muted-foreground'>
                      No assignments
                    </span>
                  )}
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
                        onClick={() => handleEditClick(instructor)}
                        className='cursor-pointer flex items-center gap-2'
                      >
                        <Edit className='w-4 h-4' />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => setDeleteId(instructor.id)}
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
      </div>

      {/* Edit Dialog */}
      <Dialog
        open={editInstructor !== null}
        onOpenChange={() => {
          setEditInstructor(null);
          setEditAssignments([]);
        }}
      >
        <DialogContent className='max-w-3xl max-h-[90vh] overflow-y-auto'>
          <DialogHeader>
            <DialogTitle>Edit Instructor</DialogTitle>
            <DialogDescription>
              Update instructor information and teaching assignments.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditSubmit}>
            <div className='space-y-6 py-4'>
              {/* Basic Information */}
              <div className='space-y-4'>
                <h3 className='text-sm font-semibold'>Basic Information</h3>
                <div className='grid grid-cols-2 gap-4'>
                  <div className='space-y-2'>
                    <Label htmlFor='edit-facultyId'>Faculty ID</Label>
                    <Input
                      id='edit-facultyId'
                      value={editFormData.facultyId}
                      onChange={(e) =>
                        setEditFormData({
                          ...editFormData,
                          facultyId: e.target.value,
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
                </div>
              </div>

              {/* Teaching Assignments */}
              <div className='space-y-4'>
                <div className='flex items-center justify-between'>
                  <div className='space-y-1'>
                    <h3 className='text-sm font-semibold'>
                      Teaching Assignments
                    </h3>
                    <p className='text-xs text-muted-foreground'>
                      Manage courses and sections for this instructor
                    </p>
                  </div>
                  <Button
                    type='button'
                    size='sm'
                    variant='outline'
                    onClick={addEditAssignment}
                    className='gap-2'
                  >
                    <Plus className='h-4 w-4' />
                    Add
                  </Button>
                </div>

                <div className='space-y-3'>
                  {editAssignments.map((assignment, index) => (
                    <Card key={assignment.id} className='border border-border'>
                      <CardHeader className='pb-3'>
                        <div className='flex items-center justify-between'>
                          <Label className='text-sm font-medium'>
                            Assignment {index + 1}
                          </Label>
                          {editAssignments.length > 1 && (
                            <Button
                              type='button'
                              variant='ghost'
                              size='sm'
                              onClick={() =>
                                removeEditAssignment(assignment.id)
                              }
                              className='h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive'
                            >
                              <X className='h-4 w-4' />
                            </Button>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className='grid grid-cols-3 gap-3'>
                          <div className='space-y-2'>
                            <Label className='text-xs'>Program</Label>
                            <Select
                              value={assignment.programId}
                              onValueChange={(value: string) =>
                                updateEditAssignment(
                                  assignment.id,
                                  "programId",
                                  value
                                )
                              }
                            >
                              <SelectTrigger className='h-10'>
                                <SelectValue placeholder='Select program' />
                              </SelectTrigger>
                              <SelectContent>
                                {programs.map((program) => (
                                  <SelectItem
                                    key={program.id}
                                    value={program.id}
                                  >
                                    {program.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div className='space-y-2'>
                            <Label className='text-xs'>Course</Label>
                            <Select
                              value={assignment.courseId}
                              onValueChange={(value: string) =>
                                updateEditAssignment(
                                  assignment.id,
                                  "courseId",
                                  value
                                )
                              }
                            >
                              <SelectTrigger className='h-10'>
                                <SelectValue placeholder='Select course' />
                              </SelectTrigger>
                              <SelectContent>
                                {courses.map((course) => (
                                  <SelectItem key={course.id} value={course.id}>
                                    {course.code} - {course.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div className='space-y-2'>
                            <Label className='text-xs'>Section</Label>
                            <Select
                              value={assignment.sectionId}
                              onValueChange={(value: string) =>
                                updateEditAssignment(
                                  assignment.id,
                                  "sectionId",
                                  value
                                )
                              }
                            >
                              <SelectTrigger className='h-10'>
                                <SelectValue placeholder='Select section' />
                              </SelectTrigger>
                              <SelectContent>
                                {sections.map((section) => (
                                  <SelectItem
                                    key={section.id}
                                    value={section.id}
                                  >
                                    {section.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button
                type='button'
                variant='outline'
                onClick={() => {
                  setEditInstructor(null);
                  setEditAssignments([]);
                }}
                disabled={isEditing}
              >
                Cancel
              </Button>
              <Button type='submit' disabled={isEditing}>
                {isEditing ? "Updating..." : "Update Instructor"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={deleteId !== null}
        onOpenChange={() => setDeleteId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Instructor</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              instructor and their associated teaching assignments.
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
    </div>
  );
}
