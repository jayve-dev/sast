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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { BookOpen, Plus, MoreHorizontal, Trash2, Edit } from "lucide-react";
import { toast } from "sonner";
import type React from "react";

interface Program {
  id: string;
  name: string;
}

interface Course {
  id: string;
  code: string;
  name: string;
  programId: string;
  sectionId: string;
}

interface Section {
  id: string;
  name: string;
  programId: string;
}

export default function DepartmentDashboard() {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);

  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteType, setDeleteType] = useState<
    "program" | "course" | "section" | null
  >(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [editItem, setEditItem] = useState<Program | Course | Section | null>(
    null
  );
  const [editType, setEditType] = useState<
    "program" | "course" | "section" | null
  >(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editFormData, setEditFormData] = useState({ name: "", code: "" });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [programRes, courseRes, sectionRes] = await Promise.all([
        fetch("/api/create/department/program"),
        fetch("/api/create/department/course"),
        fetch("/api/create/department/section"),
      ]);
      const programData = await programRes.json();
      const courseData = await courseRes.json();
      const sectionData = await sectionRes.json();
      setPrograms(Array.isArray(programData) ? programData : []);
      setCourses(Array.isArray(courseData) ? courseData : []);
      setSections(Array.isArray(sectionData) ? sectionData : []);
    } catch (error) {
      console.error("Failed to fetch data:", error);
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId || !deleteType) return;

    setIsDeleting(true);
    try {
      const res = await fetch(
        `/api/create/department/${deleteType}/${deleteId}`,
        {
          method: "DELETE",
        }
      );

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.message || `Failed to delete ${deleteType}`);
      }

      toast.success(
        `${
          deleteType.charAt(0).toUpperCase() + deleteType.slice(1)
        } deleted successfully`
      );

      if (deleteType === "program") {
        setPrograms(programs.filter((p) => p.id !== deleteId));
      } else if (deleteType === "course") {
        setCourses(courses.filter((c) => c.id !== deleteId));
      } else if (deleteType === "section") {
        setSections(sections.filter((s) => s.id !== deleteId));
      }

      setDeleteId(null);
      setDeleteType(null);
    } catch (error) {
      console.error("Delete error:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to delete";
      toast.error(errorMessage);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleEditClick = (
    item: Program | Course | Section,
    type: "program" | "course" | "section"
  ) => {
    setEditItem(item);
    setEditType(type);
    if (type === "program" || type === "section") {
      setEditFormData({ name: item.name, code: "" });
    } else {
      setEditFormData({
        name: (item as Course).name,
        code: (item as Course).code,
      });
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editItem || !editType) return;

    setIsEditing(true);
    try {
      const payload =
        editType === "course"
          ? { name: editFormData.name, code: editFormData.code }
          : { name: editFormData.name };

      const res = await fetch(
        `/api/create/department/${editType}/${editItem.id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.message || `Failed to update ${editType}`);
      }

      toast.success(
        `${
          editType.charAt(0).toUpperCase() + editType.slice(1)
        } updated successfully`
      );

      if (editType === "program") {
        setPrograms(
          programs.map((p) =>
            p.id === editItem.id ? { ...p, name: editFormData.name } : p
          )
        );
      } else if (editType === "course") {
        setCourses(
          courses.map((c) =>
            c.id === editItem.id
              ? { ...c, name: editFormData.name, code: editFormData.code }
              : c
          )
        );
      } else if (editType === "section") {
        setSections(
          sections.map((s) =>
            s.id === editItem.id ? { ...s, name: editFormData.name } : s
          )
        );
      }

      setEditItem(null);
      setEditType(null);
    } catch (error) {
      console.error("Update error:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to update";
      toast.error(errorMessage);
    } finally {
      setIsEditing(false);
    }
  };

  return (
    <div className='w-full min-h-screen bg-background p-2'>
      <div className='max-w-7xl mx-auto space-y-8'>
        <div className='flex justify-between items-start'>
          <div>
            <h1 className='text-3xl font-bold text-foreground text-balance'>
              Department Overview
            </h1>
            <p className='text-muted-foreground mt-2'>
              Manage your academic programs, sections, and courses
            </p>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className='gap-2'>
                <Plus className='w-4 h-4' />
                Add New
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end' className='w-56'>
              <DropdownMenuItem onSelect={(e: Event) => e.preventDefault()}>
                <AddModal triggerText='Program' title='Add Program'>
                  <ProgramAdd />
                </AddModal>
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={(e: Event) => e.preventDefault()}>
                <AddModal triggerText='Section' title='Add Section'>
                  <SectionAdd />
                </AddModal>
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={(e: Event) => e.preventDefault()}>
                <AddModal triggerText='Course' title='Add Course'>
                  <CourseAdd />
                </AddModal>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
          {/* Programs Card */}
          <Card className='border border-border hover:shadow-lg transition-shadow'>
            <CardHeader className='pb-4'>
              <div className='flex justify-between items-start'>
                <div>
                  <CardTitle className='text-lg'>Programs</CardTitle>
                  <CardDescription>Active academic programs</CardDescription>
                </div>
                <div className='bg-primary/10 p-3 rounded-lg'>
                  <BookOpen className='w-5 h-5 text-primary' />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className='space-y-2'>
                <p className='text-4xl font-bold text-foreground'>
                  {loading ? "-" : programs.length}
                </p>
                <p className='text-sm text-muted-foreground'>
                  Total programs in department
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Courses Card */}
          <Card className='border border-border hover:shadow-lg transition-shadow'>
            <CardHeader className='pb-4'>
              <div className='flex justify-between items-start'>
                <div>
                  <CardTitle className='text-lg'>Courses</CardTitle>
                  <CardDescription>Course offerings</CardDescription>
                </div>
                <div className='bg-chart-1/10 p-3 rounded-lg'>
                  <BookOpen className='w-5 h-5 text-chart-1' />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className='space-y-2'>
                <p className='text-4xl font-bold text-foreground'>
                  {loading ? "-" : courses.length}
                </p>
                <p className='text-sm text-muted-foreground'>
                  Total courses available
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Sections Card */}
          <Card className='border border-border hover:shadow-lg transition-shadow'>
            <CardHeader className='pb-4'>
              <div className='flex justify-between items-start'>
                <div>
                  <CardTitle className='text-lg'>Sections</CardTitle>
                  <CardDescription>Course sections</CardDescription>
                </div>
                <div className='bg-chart-2/10 p-3 rounded-lg'>
                  <BookOpen className='w-5 h-5 text-chart-2' />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className='space-y-2'>
                <p className='text-4xl font-bold text-foreground'>
                  {loading ? "-" : sections.length}
                </p>
                <p className='text-sm text-muted-foreground'>
                  Total active sections
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
          {/* Programs Table */}
          <Card className='border border-border'>
            <CardHeader className="flex flex-row justify-between">
              <div>
                <CardTitle>Programs</CardTitle>
                <CardDescription>Manage all academic programs</CardDescription>
              </div>
              <AddModal className="bg-black text-white px-4 py-1 rounded-md" triggerText='Add' title='Add Program'>
                  <ProgramAdd />
                </AddModal>
            </CardHeader>
            <CardContent className='p-0'>
              <div className='rounded-lg border border-border overflow-hidden'>
                {/* Table Header */}
                <div className='grid grid-cols-3 gap-4 px-6 py-4 bg-secondary/50 border-b border-border font-semibold text-sm text-foreground'>
                  <div>Name</div>
                  <div></div>
                  <div className='text-right'>Actions</div>
                </div>

                {/* Table Body */}
                <div className='divide-y divide-border'>
                  {programs.length === 0 ? (
                    <div className='px-6 py-8 text-center text-muted-foreground text-sm'>
                      No programs found
                    </div>
                  ) : (
                    programs.map((program) => (
                      <div
                        key={program.id}
                        className='grid grid-cols-3 gap-4 px-6 py-4 items-center hover:bg-secondary/30 transition-colors'
                      >
                        <div className='font-medium text-foreground'>
                          {program.name}
                        </div>
                        <div></div>
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
                                onClick={() =>
                                  handleEditClick(program, "program")
                                }
                                className='cursor-pointer flex items-center gap-2'
                              >
                                <Edit className='w-4 h-4' />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => {
                                  setDeleteId(program.id);
                                  setDeleteType("program");
                                }}
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
            </CardContent>
          </Card>

           {/* Sections Table */}
          <Card className='border border-border'>
            <CardHeader className="flex flex-row justify-between">
              <div>
                <CardTitle>Sections</CardTitle>
                <CardDescription>Manage all sections</CardDescription>
              </div>
              <AddModal triggerText='Add' title='Add Section' className="bg-black text-white px-4 py-1 rounded-md">
                  <SectionAdd />
                </AddModal>
            </CardHeader>
            <CardContent className='p-0'>
              <div className='rounded-lg border border-border overflow-hidden'>
                {/* Table Header */}
                <div className='grid grid-cols-3 gap-4 px-6 py-4 bg-secondary/50 border-b border-border font-semibold text-sm text-foreground'>
                  <div>Name</div>
                  <div></div>
                  <div className='text-right'>Actions</div>
                </div>

                {/* Table Body */}
                <div className='divide-y divide-border'>
                  {sections.length === 0 ? (
                    <div className='px-6 py-8 text-center text-muted-foreground text-sm'>
                      No sections found
                    </div>
                  ) : (
                    sections.map((section) => (
                      <div
                        key={section.id}
                        className='grid grid-cols-3 gap-4 px-6 py-4 items-center hover:bg-secondary/30 transition-colors'
                      >
                        <div className='font-medium text-foreground'>
                          {section.name}
                        </div>
                        <div></div>
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
                                onClick={() =>
                                  handleEditClick(section, "section")
                                }
                                className='cursor-pointer flex items-center gap-2'
                              >
                                <Edit className='w-4 h-4' />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => {
                                  setDeleteId(section.id);
                                  setDeleteType("section");
                                }}
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
            </CardContent>
          </Card>

          {/* Courses Table */}
          <Card className='border border-border'>
            <CardHeader className="flex flex-row justify-between">
              <div>
                <CardTitle>Courses</CardTitle>
                <CardDescription>Manage all courses</CardDescription>
              </div>
              <AddModal triggerText='Add' title='Add Course' className="bg-black text-white px-4 py-1 rounded-md">
                  <CourseAdd />
                </AddModal>
            </CardHeader>
            <CardContent className='p-0'>
              <div className='rounded-lg border border-border overflow-hidden'>
                {/* Table Header */}
                <div className='grid grid-cols-4 gap-4 px-6 py-4 bg-secondary/50 border-b border-border font-semibold text-sm text-foreground'>
                  <div>Code</div>
                  <div>Name</div>
                  <div></div>
                  <div className='text-right'>Actions</div>
                </div>

                {/* Table Body */}
                <div className='divide-y divide-border'>
                  {courses.length === 0 ? (
                    <div className='px-6 py-8 text-center text-muted-foreground text-sm'>
                      No courses found
                    </div>
                  ) : (
                    courses.map((course) => (
                      <div
                        key={course.id}
                        className='grid grid-cols-4 gap-4 px-6 py-4 items-center hover:bg-secondary/30 transition-colors'
                      >
                        <div className='font-medium text-foreground'>
                          {course.code}
                        </div>
                        <div className='text-foreground'>{course.name}</div>
                        <div></div>
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
                                onClick={() =>
                                  handleEditClick(course, "course")
                                }
                                className='cursor-pointer flex items-center gap-2'
                              >
                                <Edit className='w-4 h-4' />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => {
                                  setDeleteId(course.id);
                                  setDeleteType("course");
                                }}
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
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Edit Dialog */}
      <Dialog open={editItem !== null} onOpenChange={() => setEditItem(null)}>
        <DialogContent className='max-w-md'>
          <DialogHeader>
            <DialogTitle>
              Edit{" "}
              {editType
                ? editType.charAt(0).toUpperCase() + editType.slice(1)
                : "Item"}
            </DialogTitle>
            <DialogDescription>Update the information below.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditSubmit}>
            <div className='space-y-4 py-4'>
              {editType === "course" && (
                <div className='space-y-2'>
                  <Label htmlFor='code'>Code</Label>
                  <Input
                    id='code'
                    value={editFormData.code}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, code: e.target.value })
                    }
                    required
                  />
                </div>
              )}
              <div className='space-y-2'>
                <Label htmlFor='name'>Name</Label>
                <Input
                  id='name'
                  value={editFormData.name}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, name: e.target.value })
                  }
                  required
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type='button'
                variant='outline'
                onClick={() => setEditItem(null)}
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

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={deleteId !== null}
        onOpenChange={() => setDeleteId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Delete{" "}
              {deleteType
                ? deleteType.charAt(0).toUpperCase() + deleteType.slice(1)
                : "Item"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              item.
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
