"use client";
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
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  MoreHorizontal,
  Trash2,
  Edit,
  BookOpen,
  Plus,
  X,
  Search,
  ChevronLeft,
  ChevronRight,
  Eye,
  User,
  GraduationCap,
} from "lucide-react";
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

const ITEMS_PER_PAGE = 15;

export default function InstructorsPage() {
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [filteredInstructors, setFilteredInstructors] = useState<Instructor[]>(
    []
  );
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Search state
  const [searchTerm, setSearchTerm] = useState("");

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);

  // Detail view state
  const [detailInstructor, setDetailInstructor] = useState<Instructor | null>(
    null
  );

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

  // Apply search filter
  useEffect(() => {
    applyFilters();
    setCurrentPage(1); // Reset to first page when search changes
  }, [searchTerm, instructors]);

  const fetchInstructors = async () => {
    try {
      const res = await fetch("/api/create/instructor");
      const data = await res.json();
      setInstructors(data);
      setFilteredInstructors(data);
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

  const applyFilters = () => {
    let filtered = [...instructors];

    if (searchTerm) {
      filtered = filtered.filter(
        (instructor) =>
          instructor.fullName
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          String(instructor.facultyId)
            .toLowerCase()
            .includes(searchTerm.toLowerCase())
      );
    }

    setFilteredInstructors(filtered);
  };

  const clearSearch = () => {
    setSearchTerm("");
  };

  // Pagination calculations
  const totalPages = Math.ceil(filteredInstructors.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentInstructors = filteredInstructors.slice(startIndex, endIndex);

  const goToNextPage = () =>
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  const goToPreviousPage = () =>
    setCurrentPage((prev) => Math.max(prev - 1, 1));

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

      // Adjust current page if needed
      const newFilteredLength = filteredInstructors.length - 1;
      const newTotalPages = Math.ceil(newFilteredLength / ITEMS_PER_PAGE);
      if (currentPage > newTotalPages && newTotalPages > 0) {
        setCurrentPage(newTotalPages);
      }
    } catch (error) {
      toast.error("Failed to delete instructor");
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
    <div className='min-h-screen w-full bg-background p-2 text-black'>
      <div className='flex flex-row justify-between items-center mb-4'>
        <div>
          <h1 className='text-3xl font-bold text-foreground'>Instructors</h1>
          <p className='text-muted-foreground mt-2'>
            Manage faculty members and instructors
          </p>
        </div>
        <Link href='/instructors/add-instructor'>
          <Button>Add Instructor</Button>
        </Link>
      </div>

      {/* Search and Stats Section */}
      <div className='mb-6 space-y-4'>
        <div className='bg-card border border-border rounded-lg p-4'>
          <div className='flex flex-col md:flex-row gap-4 items-end'>
            {/* Search Input */}
            <div className='flex-1 space-y-2'>
              <Label htmlFor='search' className='text-sm font-medium'>
                Search Instructors
              </Label>
              <div className='relative'>
                <Search className='absolute left-3 top-3 h-4 w-4 text-muted-foreground' />
                <Input
                  id='search'
                  placeholder='Search by name or faculty ID...'
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className='pl-9'
                />
              </div>
            </div>

            <div className='bg-card border border-border rounded-lg p-2 flex flex-row justify-center items-center gap-2'>
              <p className='text-sm text-muted-foreground'>
                Total Instructors:
              </p>
              <p className='text-2xl font-bold text-foreground'>
                {instructors.length}
              </p>
            </div>
          </div>

          {/* Active Search Display */}
          {searchTerm && (
            <div className='mt-4 flex flex-wrap gap-2 items-center'>
              <span className='text-sm text-muted-foreground flex items-center gap-1'>
                <Search className='w-4 h-4' />
                Searching for:
              </span>
              <div className='inline-flex items-center gap-1 px-2 py-1 bg-secondary rounded-md text-sm'>
                <span className='font-medium'>{searchTerm}</span>
                <button
                  onClick={clearSearch}
                  className='ml-1 hover:bg-secondary-foreground/10 rounded-full p-0.5'
                >
                  <X className='w-3 h-3' />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Instructors Table */}
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
          {currentInstructors.length === 0 ? (
            <div className='px-6 py-12 text-center'>
              <p className='text-muted-foreground mb-2'>
                {searchTerm
                  ? "No instructors found matching your search"
                  : "No instructors found"}
              </p>
              {searchTerm && (
                <Button
                  variant='outline'
                  size='sm'
                  onClick={clearSearch}
                  className='gap-2'
                >
                  <X className='w-4 h-4' />
                  Clear Search
                </Button>
              )}
            </div>
          ) : (
            currentInstructors.map((instructor, index) => (
              <div
                key={instructor.id}
                className='grid grid-cols-4 gap-4 px-6 py-4 items-center hover:bg-secondary/30 transition-colors'
              >
                <div className='flex items-center gap-3'>
                  <span className='font-medium text-foreground'>
                    {instructor.facultyId}
                  </span>
                </div>
                <div className='text-foreground'>{instructor.fullName}</div>
                <div className='flex items-center gap-2'>
                  <Badge
                    variant={
                      instructor.assigns && instructor.assigns.length > 0
                        ? "default"
                        : "secondary"
                    }
                    className='text-sm px-3 py-1'
                  >
                    <BookOpen className='w-4 h-4 mr-1' />
                    {instructor.assigns ? instructor.assigns.length : 0}{" "}
                    {instructor.assigns && instructor.assigns.length === 1
                      ? "Assignment"
                      : "Assignments"}
                  </Badge>
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
                        onClick={() => setDetailInstructor(instructor)}
                        className='cursor-pointer flex items-center gap-2'
                      >
                        <Eye className='w-4 h-4' />
                        View Details
                      </DropdownMenuItem>
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

        {/* Pagination */}
        {filteredInstructors.length > 0 && (
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

      {/* Detail View Dialog */}
      <Dialog
        open={detailInstructor !== null}
        onOpenChange={() => setDetailInstructor(null)}
      >
        <DialogContent className='max-w-4xl max-h-[90vh] overflow-y-auto'>
          <DialogHeader>
            <DialogTitle className='flex items-center gap-2 text-2xl'>
              <User className='w-6 h-6' />
              Instructor Details
            </DialogTitle>
            <DialogDescription>
              Complete information about the instructor and their teaching
              assignments
            </DialogDescription>
          </DialogHeader>

          {detailInstructor && (
            <div className='space-y-6 py-4'>
              {/* Basic Information Card */}
              <Card>
                <CardHeader className='pb-3'>
                  <h3 className='text-lg font-semibold flex items-center gap-2'>
                    <User className='w-5 h-5' />
                    Basic Information
                  </h3>
                </CardHeader>
                <CardContent className='space-y-4'>
                  <div className='grid grid-cols-2 gap-6'>
                    <div className='space-y-1'>
                      <Label className='text-sm text-muted-foreground'>
                        Faculty ID
                      </Label>
                      <p className='text-base font-medium'>
                        {detailInstructor.facultyId}
                      </p>
                    </div>
                    <div className='space-y-1'>
                      <Label className='text-sm text-muted-foreground'>
                        Full Name
                      </Label>
                      <p className='text-base font-medium'>
                        {detailInstructor.fullName}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Teaching Assignments Card */}
              <Card>
                <CardHeader className='pb-3'>
                  <div className='flex items-center justify-between'>
                    <h3 className='text-lg font-semibold flex items-center gap-2'>
                      <GraduationCap className='w-5 h-5' />
                      Teaching Assignments
                    </h3>
                    <Badge variant='secondary' className='text-base px-3 py-1'>
                      {detailInstructor.assigns
                        ? detailInstructor.assigns.length
                        : 0}{" "}
                      Total
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  {detailInstructor.assigns &&
                  detailInstructor.assigns.length > 0 ? (
                    <div className='space-y-3'>
                      {detailInstructor.assigns.map((assignment, index) => (
                        <Card
                          key={assignment.id}
                          className='border-2 hover:border-primary/50 transition-colors'
                        >
                          <CardContent className='p-4'>
                            <div className='flex items-start justify-between mb-3'>
                              <div className='flex items-center gap-2'>
                                <div className='w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center'>
                                  <span className='text-sm font-semibold text-primary'>
                                    {index + 1}
                                  </span>
                                </div>
                                <div>
                                  <h4 className='font-semibold text-lg'>
                                    {assignment.Course.code}
                                  </h4>
                                  <p className='text-sm text-muted-foreground'>
                                    {assignment.Course.name}
                                  </p>
                                </div>
                              </div>
                            </div>

                            <div className='grid grid-cols-2 gap-4 mt-3 pt-3 border-t'>
                              <div className='space-y-1'>
                                <Label className='text-xs text-muted-foreground'>
                                  Program
                                </Label>
                                <p className='text-sm font-medium'>
                                  {assignment.Program.name}
                                </p>
                              </div>
                              <div className='space-y-1'>
                                <Label className='text-xs text-muted-foreground'>
                                  Section
                                </Label>
                                <p className='text-sm font-medium'>
                                  {assignment.Section.name}
                                </p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className='text-center py-8'>
                      <BookOpen className='w-12 h-12 mx-auto text-muted-foreground mb-2' />
                      <p className='text-muted-foreground'>
                        No teaching assignments yet
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          <DialogFooter>
            <Button variant='outline' onClick={() => setDetailInstructor(null)}>
              Close
            </Button>
            {detailInstructor && (
              <Button
                onClick={() => {
                  handleEditClick(detailInstructor);
                  setDetailInstructor(null);
                }}
                className='gap-2'
              >
                <Edit className='w-4 h-4' />
                Edit Instructor
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
                  {editAssignments.map((assignment, index) => {
                    // Filter courses based on selected program
                    const filteredCourses = assignment.programId
                      ? courses.filter(
                          (course: any) =>
                            course.programId === assignment.programId
                        )
                      : [];

                    // Filter sections based on selected program
                    const filteredSections = assignment.programId
                      ? sections.filter(
                          (section: any) =>
                            section.programId === assignment.programId
                        )
                      : [];

                    return (
                      <Card
                        key={assignment.id}
                        className='border border-border'
                      >
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
                                onValueChange={(value: string) => {
                                  setEditAssignments(
                                    editAssignments.map((a) =>
                                      a.id === assignment.id
                                        ? {
                                            ...a,
                                            programId: value,
                                            courseId: "",
                                            sectionId: "",
                                          }
                                        : a
                                    )
                                  );
                                }}
                              >
                                <SelectTrigger className='h-10 w-full'>
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
                                disabled={!assignment.programId}
                              >
                                <SelectTrigger className='h-10 w-full'>
                                  <SelectValue placeholder='Select course' />
                                </SelectTrigger>
                                <SelectContent>
                                  {filteredCourses.length > 0 ? (
                                    filteredCourses.map((course) => (
                                      <SelectItem
                                        key={course.id}
                                        value={course.id}
                                      >
                                        {course.code} - {course.name}
                                      </SelectItem>
                                    ))
                                  ) : (
                                    <div className='px-2 py-1.5 text-sm text-muted-foreground'>
                                      {assignment.programId
                                        ? "No courses available"
                                        : "Select a program first"}
                                    </div>
                                  )}
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
                                disabled={!assignment.programId}
                              >
                                <SelectTrigger className='h-10 w-full'>
                                  <SelectValue placeholder='Select section' />
                                </SelectTrigger>
                                <SelectContent>
                                  {filteredSections.length > 0 ? (
                                    filteredSections.map((section) => (
                                      <SelectItem
                                        key={section.id}
                                        value={section.id}
                                      >
                                        {section.name}
                                      </SelectItem>
                                    ))
                                  ) : (
                                    <div className='px-2 py-1.5 text-sm text-muted-foreground'>
                                      {assignment.programId
                                        ? "No sections available"
                                        : "Select a program first"}
                                    </div>
                                  )}
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
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
