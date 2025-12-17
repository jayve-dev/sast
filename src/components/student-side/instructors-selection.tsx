"use client";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { User, Briefcase } from "lucide-react";
import { useAssessment } from "./AssessmentContext";

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
  programId: string;
  courseId: string;
  sectionId: string;
  Course: Course;
  Section: Section;
  Program: Program;
}

interface Instructor {
  id: string;
  facultyId: string;
  fullName: string;
  assigns: Assignment[];
}

const InstructorsSelection = () => {
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [loading, setLoading] = useState(true);
  const { selection, setInstructor } = useAssessment();

  useEffect(() => {
    if (selection.programId && selection.sectionId && selection.courseId) {
      fetchInstructors();
    }
  }, [selection.programId, selection.sectionId, selection.courseId]);

  const fetchInstructors = async () => {
    try {
      const response = await fetch("/api/create/instructor");

      if (!response.ok) {
        throw new Error("Failed to fetch instructors");
      }

      const data = await response.json();

      // Filter instructors who teach the selected program, section, and course
      const filteredInstructors = Array.isArray(data)
        ? data
            .map((instructor: Instructor) => ({
              ...instructor,
              assigns: instructor.assigns.filter(
                (assignment) =>
                  assignment.programId === selection.programId &&
                  assignment.sectionId === selection.sectionId &&
                  assignment.courseId === selection.courseId
              ),
            }))
            .filter((instructor: Instructor) => instructor.assigns.length > 0)
        : [];

      setInstructors(filteredInstructors);
    } catch (error) {
      console.error("Error fetching instructors:", error);
      toast.error("Failed to load instructors");
      setInstructors([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectInstructor = (instructor: Instructor) => {
    // Get the assignment ID for this specific combination
    const assignment = instructor.assigns[0];
    if (assignment) {
      setInstructor(instructor.id, assignment.id);
      toast.success(`Selected ${instructor.fullName}`);
    }
  };

  if (loading) {
    return (
      <div className='flex items-center justify-center p-8'>
        <p className='text-muted-foreground'>Loading instructors...</p>
      </div>
    );
  }

  if (instructors.length === 0) {
    return (
      <div className='flex items-center justify-center p-8 w-full'>
        <p className='text-muted-foreground'>
          No instructors available for this course
        </p>
      </div>
    );
  }

  return (
    <div className='space-y-6 w-full p-2'>
      <div>
        <h2 className='text-2xl font-semibold text-foreground mb-2'>
          Select an Instructor
        </h2>
        <p className='text-sm text-muted-foreground'>
          Choose the instructor to evaluate
        </p>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
        {instructors.map((instructor) => (
          <button
            key={instructor.id}
            onClick={() => handleSelectInstructor(instructor)}
            className={`group relative overflow-hidden rounded-lg border-2 transition-all duration-300 p-6 text-left ${
              selection.instructorId === instructor.id
                ? "border-primary bg-primary/5"
                : "border-border hover:border-primary/50 bg-card hover:bg-secondary"
            }`}
          >
            <div className='flex items-start gap-4 mb-4'>
              <div className='flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 shrink-0'>
                <User className='h-6 w-6 text-primary' />
              </div>

              <div className='flex-1 min-w-0'>
                <h3 className='font-semibold text-foreground text-base truncate group-hover:text-primary transition-colors'>
                  {instructor.fullName}
                </h3>
                <p className='text-xs text-muted-foreground mt-1 flex items-center gap-1'>
                  <Briefcase className='h-3 w-3' />
                  Faculty ID: {instructor.facultyId}
                </p>
              </div>
            </div>

            <div className='mt-4 pt-4 border-t border-border'>
              <div className='space-y-1'>
                {instructor.assigns[0] && (
                  <>
                    <p className='text-xs font-medium text-foreground'>
                      {instructor.assigns[0].Course.code} -{" "}
                      {instructor.assigns[0].Course.name}
                    </p>
                    <p className='text-xs text-muted-foreground'>
                      {instructor.assigns[0].Program.name} -{" "}
                      {instructor.assigns[0].Section.name}
                    </p>
                  </>
                )}
              </div>
            </div>

            {selection.instructorId === instructor.id && (
              <div className='absolute top-2 right-2 h-3 w-3 rounded-full bg-primary'></div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

export { InstructorsSelection };
