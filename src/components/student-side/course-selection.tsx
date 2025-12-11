"use client";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { BookOpen, Code } from "lucide-react";
import { useAssessment } from "./AssessmentContext";

interface Course {
  id: string;
  code: string;
  name: string;
  programId: string;
  sectionId: string;
}

const CourseSelection = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const { selection, setCourse } = useAssessment();

  useEffect(() => {
    if (selection.programId && selection.sectionId) {
      fetchCourses();
    }
  }, [selection.programId, selection.sectionId]);

  const fetchCourses = async () => {
    try {
      const response = await fetch("/api/create/department/course");

      if (!response.ok) {
        throw new Error("Failed to fetch courses");
      }

      const data = await response.json();

      // Filter courses by selected program and section
      const filteredCourses = Array.isArray(data)
        ? data.filter(
            (course: Course) =>
              course.programId === selection.programId &&
              course.sectionId === selection.sectionId
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
    toast.success(`Selected ${course.code} - ${course.name}`);
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
        <p className='text-muted-foreground'>
          No courses available for this section
        </p>
      </div>
    );
  }

  return (
    <div className='space-y-6 w-full'>
      <div>
        <h2 className='text-2xl font-semibold text-foreground mb-2'>
          Select a Course
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
            <div className='flex items-start gap-4 mb-3'>
              <div className='flex h-12 w-12 items-center justify-center rounded-full bg-chart-1/10 shrink-0'>
                <BookOpen className='h-6 w-6 text-chart-1' />
              </div>

              <div className='flex-1 min-w-0'>
                <div className='flex items-center gap-2 mb-1'>
                  <Code className='h-4 w-4 text-primary' />
                  <span className='text-sm font-mono font-semibold text-primary'>
                    {course.code}
                  </span>
                </div>
                <h3 className='font-semibold text-foreground text-base line-clamp-2 group-hover:text-primary transition-colors'>
                  {course.name}
                </h3>
              </div>
            </div>

            <div className='mt-4 pt-3 border-t border-border'>
              <span className='inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-chart-1/10 text-chart-1'>
                Course
              </span>
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
