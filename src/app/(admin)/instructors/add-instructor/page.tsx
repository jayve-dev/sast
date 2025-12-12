"use client";
import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { X, Plus } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Link from "next/link";

type Program = {
  id: string;
  name: string;
};

type Course = {
  id: string;
  code: string;
  name: string;
  programId: string;
  sectionId: string;
};

type Section = {
  id: string;
  name: string;
  programId: string;
};

type Assignment = {
  id: string;
  programId: string;
  courseId: string;
  sectionId: string;
};

// Updated schema
const CreateInstructorWithAssignmentsSchema = z.object({
  facultyId: z.string().min(1, "Faculty ID is required"),
  fullName: z.string().min(1, "Full name is required"),
  assignments: z
    .array(
      z.object({
        programId: z.string().min(1, "Program is required"),
        courseId: z.string().min(1, "Course is required"),
        sectionId: z.string().min(1, "Section is required"),
      })
    )
    .min(1, "At least one assignment is required"),
});

type FormData = z.infer<typeof CreateInstructorWithAssignmentsSchema>;

export default function InstructorAdd() {
  const router = useRouter();
  const [isLoading, setLoading] = useState(false);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [allCourses, setAllCourses] = useState<Course[]>([]);
  const [allSections, setAllSections] = useState<Section[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([
    { id: "1", programId: "", courseId: "", sectionId: "" },
  ]);

  const form = useForm<FormData>({
    resolver: zodResolver(CreateInstructorWithAssignmentsSchema),
    defaultValues: {
      facultyId: "",
      fullName: "",
      assignments: [{ programId: "", courseId: "", sectionId: "" }],
    },
  });

  // Fetch programs, courses, and sections
  useEffect(() => {
    async function fetchData() {
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
        setAllCourses(Array.isArray(coursesData) ? coursesData : []);
        setAllSections(Array.isArray(sectionsData) ? sectionsData : []);
      } catch (error) {
        console.error("Failed to fetch data:", error);
        toast.error("Failed to load form data");
      }
    }
    fetchData();
  }, []);

  // Get filtered sections based on selected program
  const getFilteredSections = (programId: string) => {
    if (!programId) return [];
    return allSections.filter((section) => section.programId === programId);
  };

  // Get filtered courses based on selected program and section
  const getFilteredCourses = (programId: string, sectionId: string) => {
    if (!programId) return [];

    // If section is selected, filter by both program and section
    if (sectionId) {
      return allCourses.filter(
        (course) =>
          course.programId === programId && course.sectionId === sectionId
      );
    }

    // Otherwise, just filter by program
    return allCourses.filter((course) => course.programId === programId);
  };

  const addAssignment = () => {
    const newId = (assignments.length + 1).toString();
    const newAssignment = {
      id: newId,
      programId: "",
      courseId: "",
      sectionId: "",
    };
    setAssignments([...assignments, newAssignment]);

    const currentAssignments = form.getValues("assignments");
    form.setValue("assignments", [
      ...currentAssignments,
      { programId: "", courseId: "", sectionId: "" },
    ]);
  };

  const removeAssignment = (id: string) => {
    if (assignments.length > 1) {
      const index = assignments.findIndex((a) => a.id === id);
      const newAssignments = assignments.filter((a) => a.id !== id);
      setAssignments(newAssignments);

      const currentAssignments = form.getValues("assignments");
      currentAssignments.splice(index, 1);
      form.setValue("assignments", currentAssignments);
    }
  };

  // Handle program change - reset section and course
  const handleProgramChange = (index: number, programId: string) => {
    form.setValue(`assignments.${index}.programId`, programId);
    form.setValue(`assignments.${index}.sectionId`, "");
    form.setValue(`assignments.${index}.courseId`, "");

    // Update local state
    const updatedAssignments = [...assignments];
    updatedAssignments[index] = {
      ...updatedAssignments[index],
      programId,
      sectionId: "",
      courseId: "",
    };
    setAssignments(updatedAssignments);
  };

  // Handle section change - reset course
  const handleSectionChange = (index: number, sectionId: string) => {
    form.setValue(`assignments.${index}.sectionId`, sectionId);
    form.setValue(`assignments.${index}.courseId`, "");

    // Update local state
    const updatedAssignments = [...assignments];
    updatedAssignments[index] = {
      ...updatedAssignments[index],
      sectionId,
      courseId: "",
    };
    setAssignments(updatedAssignments);
  };

  const onSubmit = async (data: FormData) => {
    setLoading(true);

    try {
      // First create the instructor
      const instructorPayload = {
        facultyId: Number(data.facultyId),
        fullName: data.fullName,
      };

      const instructorResponse = await fetch("/api/create/instructor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(instructorPayload),
      });

      const instructorData = await instructorResponse.json();

      if (!instructorResponse.ok) {
        throw new Error(
          instructorData.message || "Failed to create instructor"
        );
      }

      const teacherId = instructorData.id;

      // Then create the assignments
      const assignmentPromises = data.assignments.map(async (assignment) => {
        const payload = {
          teacherId,
          programId: assignment.programId,
          courseId: assignment.courseId,
          sectionId: assignment.sectionId,
        };

        const response = await fetch("/api/create/teacherAssignment", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        return response;
      });

      const assignmentResults = await Promise.all(assignmentPromises);

      const failedAssignments = assignmentResults.filter((res) => !res.ok);
      if (failedAssignments.length > 0) {
        toast.warning(
          `Instructor created but ${failedAssignments.length} assignment(s) failed`
        );
      } else {
        toast.success(
          `Instructor created with ${data.assignments.length} assignment(s)`
        );
      }

      form.reset();
      setAssignments([
        {
          id: "1",
          programId: "",
          courseId: "",
          sectionId: "",
        },
      ]);

      // Optionally refresh the page or redirect
      router.refresh();
    } catch (error) {
      console.error("Error:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to create instructor";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-[900px] p-4 md:p-10">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-8'>
          <div className='space-y-2 flex flex-row justify-between'>
            <div>
                <h2 className='text-lg font-semibold text-foreground'>
                  Instructor Information
                </h2>
                <p className='text-sm text-muted-foreground'>
                  Enter the instructor&apos;s basic details
                </p>
            </div>

            <Link href='/instructors'>
              <Button>Back</Button>
            </Link>
          </div>

          <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
            <FormField
              control={form.control}
              name='facultyId'
              render={({ field }) => (
                <FormItem>
                  <FormLabel className='text-sm font-medium'>
                    Faculty ID
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type='number'
                      placeholder='1234567'
                      className='h-10'
                    />
                  </FormControl>
                  <FormMessage className='text-xs' />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='fullName'
              render={({ field }) => (
                <FormItem>
                  <FormLabel className='text-sm font-medium'>
                    Full Name
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder='Prof. John Doe'
                      className='h-10'
                    />
                  </FormControl>
                  <FormMessage className='text-xs' />
                </FormItem>
              )}
            />
          </div>

          <div className='space-y-4'>
            <div className='flex items-center justify-between'>
              <div className='space-y-1'>
                <h3 className='text-base font-semibold text-foreground'>
                  Teaching Assignments
                </h3>
                <p className='text-sm text-muted-foreground'>
                  Add courses and sections this instructor will teach
                </p>
              </div>
              <Button
                type='button'
                size='sm'
                variant='outline'
                onClick={addAssignment}
                className='gap-2 bg-transparent'
              >
                <Plus className='h-4 w-4' />
                Add
              </Button>
            </div>

            <div className='space-y-3'>
              {assignments.map((assignment, index) => {
                const filteredSections = getFilteredSections(
                  assignment.programId
                );
                const filteredCourses = getFilteredCourses(
                  assignment.programId,
                  assignment.sectionId
                );

                return (
                  <Card key={assignment.id} className='border border-border'>
                    <CardHeader className='pb-3'>
                      <div className='flex items-center justify-between'>
                        <Label className='text-sm font-medium'>
                          Assignment {index + 1}
                        </Label>
                        {assignments.length > 1 && (
                          <Button
                            type='button'
                            variant='ghost'
                            size='sm'
                            onClick={() => removeAssignment(assignment.id)}
                            className='h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive'
                          >
                            <X className='h-4 w-4' />
                          </Button>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className=''>
                      <div className='grid grid-cols-1 sm:grid-cols-3 gap-3'>
                        {/* Program Select */}
                        <FormField
                          control={form.control}
                          name={`assignments.${index}.programId`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className='text-xs font-medium'>
                                Program
                              </FormLabel>
                              <Select
                                onValueChange={(value) =>
                                  handleProgramChange(index, value)
                                }
                                value={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger className='h-10 w-full'>
                                    <SelectValue placeholder='Select program' />
                                  </SelectTrigger>
                                </FormControl>
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
                              <FormMessage className='text-xs' />
                            </FormItem>
                          )}
                        />

                        {/* Section Select - Filtered by Program */}
                        <FormField
                          control={form.control}
                          name={`assignments.${index}.sectionId`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className='text-xs font-medium'>
                                Section
                              </FormLabel>
                              <Select
                                onValueChange={(value) =>
                                  handleSectionChange(index, value)
                                }
                                value={field.value}
                                disabled={!assignment.programId}
                              >
                                <FormControl>
                                  <SelectTrigger className='h-10 w-full'>
                                    <SelectValue
                                      placeholder={
                                        !assignment.programId
                                          ? "Select program first"
                                          : "Select section"
                                      }
                                    />
                                  </SelectTrigger>
                                </FormControl>
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
                                      No sections available
                                    </div>
                                  )}
                                </SelectContent>
                              </Select>
                              <FormMessage className='text-xs' />
                            </FormItem>
                          )}
                        />

                        {/* Course Select - Filtered by Program and Section */}
                        <FormField
                          control={form.control}
                          name={`assignments.${index}.courseId`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className='text-xs font-medium'>
                                Course
                              </FormLabel>
                              <Select
                                onValueChange={field.onChange}
                                value={field.value}
                                disabled={
                                  !assignment.programId || !assignment.sectionId
                                }
                              >
                                <FormControl>
                                  <SelectTrigger className='h-10 w-full'>
                                    <SelectValue
                                      placeholder={
                                        !assignment.programId
                                          ? "Select program first"
                                          : !assignment.sectionId
                                          ? "Select section first"
                                          : "Select course"
                                      }
                                    />
                                  </SelectTrigger>
                                </FormControl>
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
                                      No courses available
                                    </div>
                                  )}
                                </SelectContent>
                              </Select>
                              <FormMessage className='text-xs' />
                            </FormItem>
                          )}
                        />
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          <Button
            type='submit'
            className='w-full h-10 font-medium'
            disabled={isLoading}
          >
            {isLoading ? "Creating..." : "Add Instructor"}
          </Button>
        </form>
      </Form>
    </div>
  );
}
