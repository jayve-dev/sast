"use client";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { BookOpen, Clock } from "lucide-react";
import { useAssessment } from "./AssessmentContext";

interface Course {
  id: string;
  code: string;
  name: string;
  programId: string;
}

const CourseSelection = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const { selection, setCourse, setCurrentStep } = useAssessment();

  useEffect(() => {
    if (selection.programId) {
      fetchCourses();
    }
  }, [selection.programId]);

  const fetchCourses = async () => {
    try {
      const response = await fetch("/api/create/department/course");

      if (!response.ok) {
        throw new Error("Failed to fetch courses");
      }

      const data = await response.json();

      // Filter courses by the student's program
      const filteredCourses = Array.isArray(data)
        ? data.filter(
            (course: Course) => course.programId === selection.programId
          )
        : [];

      setCourses(filteredCourses);
    } catch (error) {
      console.error("Error fetching courses:", error);
      toast.error("Failed to load courses");
      setCourses([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectCourse = (course: Course) => {
    setCourse(course.id);
    toast.success(`Selected ${course.name}`);
    // Move to next step after selection
    setTimeout(() => {
      setCurrentStep(3);
    }, 300);
  };

  if (loading) {
    return (
      <div className='flex items-center justify-center p-8'>
        <p className='text-muted-foreground'>Loading courses...</p>
      </div>
    );
  }

  if (courses.length === 0) {
    return (
      <div className='flex items-center justify-center p-8'>
        <div className='text-center space-y-2'>
          <p className='text-muted-foreground'>No courses available</p>
          <p className='text-sm text-muted-foreground'>
            There are no courses configured for your program yet.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className='space-y-6 w-full p-2'>
      <div>
        <h2 className='text-2xl font-semibold text-foreground mb-2'>
          Select Course
        </h2>
        <p className='text-sm text-muted-foreground'>
          Choose the course you want to evaluate
        </p>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
        {courses.map((course) => (
          <button
            key={course.id}
            onClick={() => handleSelectCourse(course)}
            className={`group relative overflow-hidden rounded-lg border-2 transition-all duration-300 p-6 text-left ${
              selection.courseId === course.id
                ? "border-primary bg-primary/5"
                : "border-border hover:border-primary/50 bg-card hover:bg-secondary"
            }`}
          >
            <div className='flex items-start gap-4 mb-4'>
              <div className='flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 shrink-0'>
                <BookOpen className='h-6 w-6 text-primary' />
              </div>

              <div className='flex-1 min-w-0'>
                <h3 className='font-semibold text-foreground text-lg truncate group-hover:text-primary transition-colors'>
                  {course.name}
                </h3>
                <p className='text-xs text-muted-foreground mt-1 flex items-center gap-1'>
                  <Clock className='h-3 w-3' />
                  {course.code}
                </p>
              </div>
            </div>

            {selection.courseId === course.id && (
              <div className='absolute top-2 right-2 h-3 w-3 rounded-full bg-primary'></div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

export { CourseSelection };
