"use client";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Users, BookOpen } from "lucide-react";
import { useAssessment } from "./AssessmentContext";

interface Section {
  id: string;
  name: string;
  programId: string;
  _count?: {
    students: number;
  };
}

const SectionSelection = () => {
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);
  const { selection, setSection, setCurrentStep } = useAssessment();

  useEffect(() => {
    if (selection.programId) {
      fetchSections();
    } else {
      setLoading(false);
      toast.error("Program not detected. Please contact administrator.");
    }
  }, [selection.programId]);

  const fetchSections = async () => {
    try {
      const response = await fetch("/api/create/department/section");

      if (!response.ok) {
        throw new Error("Failed to fetch sections");
      }

      const data = await response.json();

      // Filter sections by the student's program
      const filteredSections = Array.isArray(data)
        ? data.filter(
            (section: Section) => section.programId === selection.programId
          )
        : [];

      setSections(filteredSections);
    } catch (error) {
      console.error("Error fetching sections:", error);
      toast.error("Failed to load sections");
      setSections([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectSection = (section: Section) => {
    setSection(section.id);
    toast.success(`Selected ${section.name}`);
    // Move to next step after selection
    setTimeout(() => {
      setCurrentStep(2);
    }, 300);
  };

  if (loading) {
    return (
      <div className='flex items-center justify-center p-8'>
        <p className='text-muted-foreground'>Loading sections...</p>
      </div>
    );
  }

  if (!selection.programId) {
    return (
      <div className='flex items-center justify-center p-8'>
        <div className='text-center space-y-2'>
          <p className='text-muted-foreground'>Program not detected</p>
          <p className='text-sm text-red-600'>
            Your student record is missing a program assignment. Please contact
            the administrator.
          </p>
        </div>
      </div>
    );
  }

  if (sections.length === 0) {
    return (
      <div className='flex items-center justify-center p-8'>
        <div className='text-center space-y-2'>
          <p className='text-muted-foreground'>No sections available</p>
          <p className='text-sm text-muted-foreground'>
            There are no sections configured for your program yet.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className='space-y-6 w-full p-2'>
      <div>
        <h2 className='text-2xl font-semibold text-foreground mb-2'>
          Select Your Section
        </h2>
        <p className='text-sm text-muted-foreground'>
          Choose your class section
        </p>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
        {sections.map((section) => (
          <button
            key={section.id}
            onClick={() => handleSelectSection(section)}
            className={`group relative overflow-hidden rounded-lg border-2 transition-all duration-300 p-6 text-left ${
              selection.sectionId === section.id
                ? "border-primary bg-primary/5"
                : "border-border hover:border-primary/50 bg-card hover:bg-secondary"
            }`}
          >
            <div className='flex items-start gap-4 mb-4'>
              <div className='flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 shrink-0'>
                <Users className='h-6 w-6 text-primary' />
              </div>

              <div className='flex-1 min-w-0'>
                <h3 className='font-semibold text-foreground text-lg truncate group-hover:text-primary transition-colors'>
                  {section.name}
                </h3>
                <p className='text-xs text-muted-foreground mt-1 flex items-center gap-1'>
                  <BookOpen className='h-3 w-3' />
                  Class Section
                </p>
              </div>
            </div>

            {section._count && section._count.students !== undefined && (
              <div className='mt-4 pt-4 border-t border-border'>
                <div className='flex items-center justify-between text-xs text-muted-foreground'>
                  <span>{section._count.students} students</span>
                </div>
              </div>
            )}

            {selection.sectionId === section.id && (
              <div className='absolute top-2 right-2 h-3 w-3 rounded-full bg-primary'></div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

export { SectionSelection };
