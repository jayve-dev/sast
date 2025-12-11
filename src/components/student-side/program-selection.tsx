"use client";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { GraduationCap, BookOpen } from "lucide-react";
import { useAssessment } from "./AssessmentContext";

interface Program {
  id: string;
  name: string;
  _count?: {
    students: number;
    sections: number;
  };
}

const ProgramSelection = () => {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);
  const { selection, setProgram } = useAssessment();

  useEffect(() => {
    fetchPrograms();
  }, []);

  const fetchPrograms = async () => {
    try {
      const response = await fetch("/api/create/department/program");

      if (!response.ok) {
        throw new Error("Failed to fetch programs");
      }

      const data = await response.json();
      setPrograms(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching programs:", error);
      toast.error("Failed to load programs");
      setPrograms([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectProgram = (program: Program) => {
    setProgram(program.id);
    toast.success(`Selected ${program.name}`);
  };

  if (loading) {
    return (
      <div className='flex items-center justify-center p-8'>
        <p className='text-muted-foreground'>Loading programs...</p>
      </div>
    );
  }

  if (programs.length === 0) {
    return (
      <div className='flex items-center justify-center p-8'>
        <p className='text-muted-foreground'>No programs available</p>
      </div>
    );
  }

  return (
    <div className='space-y-6 w-full'>
      <div>
        <h2 className='text-2xl font-semibold text-foreground mb-2'>
          Select a Program
        </h2>
        <p className='text-sm text-muted-foreground'>
          Choose your academic program
        </p>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
        {programs.map((program) => (
          <button
            key={program.id}
            onClick={() => handleSelectProgram(program)}
            className={`group relative overflow-hidden rounded-lg border-2 transition-all duration-300 p-6 text-left ${
              selection.programId === program.id
                ? "border-primary bg-primary/5"
                : "border-border hover:border-primary/50 bg-card hover:bg-secondary"
            }`}
          >
            <div className='flex items-start gap-4 mb-4'>
              <div className='flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 shrink-0'>
                <GraduationCap className='h-6 w-6 text-primary' />
              </div>

              <div className='flex-1 min-w-0'>
                <h3 className='font-semibold text-foreground text-base truncate group-hover:text-primary transition-colors'>
                  {program.name}
                </h3>
                <p className='text-xs text-muted-foreground mt-1 flex items-center gap-1'>
                  <BookOpen className='h-3 w-3' />
                  Academic Program
                </p>
              </div>
            </div>

            {program._count && (
              <div className='mt-4 pt-4 border-t border-border'>
                <div className='flex items-center justify-between text-xs text-muted-foreground'>
                  {program._count.students !== undefined && (
                    <span>{program._count.students} students</span>
                  )}
                  {program._count.sections !== undefined && (
                    <span>{program._count.sections} sections</span>
                  )}
                </div>
              </div>
            )}

            {selection.programId === program.id && (
              <div className='absolute top-2 right-2 h-3 w-3 rounded-full bg-primary'></div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

export { ProgramSelection };
