"use client";
import React, { useState, useEffect } from "react";
import { AddModal } from "./ui/add-modal";
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
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { X } from "lucide-react";
import { toast } from "sonner";

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

type Assignment = {
  id: string;
  programId: string;
  courseId: string;
  sectionId: string;
};

type Program = { id: string; name: string };
type Course = { id: string; code: string; name: string };
type Section = { id: string; name: string };

const InstructorAdd = () => {
  const [isLoading, setLoading] = useState(false);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([
    { id: "1", programId: "", courseId: "", sectionId: "" },
  ]);

  const form = useForm({
    resolver: zodResolver(CreateInstructorWithAssignmentsSchema),
    defaultValues: {
      facultyId: "",
      fullName: "",
      assignments: [{ programId: "", courseId: "", sectionId: "" }],
    },
  });

  // Fetch programs, courses, and sections from your database
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
        setCourses(Array.isArray(coursesData) ? coursesData : []);
        setSections(Array.isArray(sectionsData) ? sectionsData : []);
      } catch (error) {
        console.error("Failed to fetch data:", error);
        toast.error("Failed to load form data");
      }
    }
    fetchData();
  }, []);

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

  const onSubmit = async (
    data: z.infer<typeof CreateInstructorWithAssignmentsSchema>
  ) => {
    setLoading(true);

    try {
      // First create the instructor
      const instructorPayload = {
        facultyId: Number(data.facultyId),
        fullName: data.fullName,
      };

      console.log("Creating instructor with:", instructorPayload);

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
      console.log("Instructor created with ID:", teacherId);
      console.log("Assignments data:", data.assignments);

      // Then create the assignments
      const assignmentPromises = data.assignments.map(
        async (assignment, index) => {
          const payload = {
            teacherId,
            programId: assignment.programId,
            courseId: assignment.courseId,
            sectionId: assignment.sectionId,
          };

          console.log(`Creating assignment ${index + 1}:`, payload);

          try {
            const response = await fetch("/api/create/teacherAssignment", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(payload),
            });

            const result = await response.json();
            console.log(
              `Assignment ${index + 1} response:`,
              response.status,
              result
            );

            if (!response.ok) {
              console.error(`Assignment ${index + 1} failed:`, result);
            }

            return { response, result };
          } catch (err) {
            console.error(`Assignment ${index + 1} error:`, err);
            throw err;
          }
        }
      );

      const assignmentResults = await Promise.all(assignmentPromises);

      const failedAssignments = assignmentResults.filter(
        ({ response }) => !response.ok
      );

      if (failedAssignments.length > 0) {
        console.error("Failed assignments:", failedAssignments);

        // Show detailed error message
        const errorMessages = failedAssignments
          .map(({ result }) => result.message)
          .join(", ");

        toast.error(
          `Instructor created but ${failedAssignments.length} assignment(s) failed: ${errorMessages}`
        );
      } else {
        toast.success(
          `Instructor created with ${data.assignments.length} assignment(s)`
        );

        form.reset();
        setAssignments([
          {
            id: "1",
            programId: "",
            courseId: "",
            sectionId: "",
          },
        ]);
      }
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
    <div>
      <AddModal title='Add Instructor' triggerText='Add Instructor'>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
            <div className='w-full grid sm:grid-cols-2 gap-4'>
              <FormField
                control={form.control}
                name='facultyId'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Faculty ID</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type='number'
                        placeholder='1234567'
                        className='w-full'
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='fullName'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder='Prof. John Doe' />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className='space-y-4'>
              <div className='flex items-center justify-between'>
                <Label className='text-base font-semibold'>
                  Teaching Assignments
                </Label>
                <Button
                  type='button'
                  variant='outline'
                  size='sm'
                  onClick={addAssignment}
                >
                  Add Assignment
                </Button>
              </div>

              {assignments.map((assignment, index) => (
                <Card key={assignment.id}>
                  <CardContent className='pt-6'>
                    <div className='space-y-4'>
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
                          >
                            <X className='h-4 w-4' />
                          </Button>
                        )}
                      </div>

                      <div className='grid sm:grid-cols-2 gap-4'>
                        <FormField
                          control={form.control}
                          name={`assignments.${index}.programId`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Program</FormLabel>
                              <Select
                                onValueChange={field.onChange}
                                value={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
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
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`assignments.${index}.courseId`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Course</FormLabel>
                              <Select
                                onValueChange={field.onChange}
                                value={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder='Select course' />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {courses.map((course) => (
                                    <SelectItem
                                      key={course.id}
                                      value={course.id}
                                    >
                                      {course.code} - {course.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`assignments.${index}.sectionId`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Section</FormLabel>
                              <Select
                                onValueChange={field.onChange}
                                value={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder='Select section' />
                                  </SelectTrigger>
                                </FormControl>
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
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Button type='submit' className='w-full' disabled={isLoading}>
              {isLoading ? "Loading..." : "ADD INSTRUCTOR"}
            </Button>
          </form>
        </Form>
      </AddModal>
    </div>
  );
};

export { InstructorAdd };
