"use client";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Users, Layers } from "lucide-react";
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
  const { selection, setSection } = useAssessment();

  useEffect(() => {
    if (selection.programId) {
      fetchSections();
    }
  }, [selection.programId]);

  const fetchSections = async () => {
    try {
      const response = await fetch("/api/create/department/section");

      if (!response.ok) {
        throw new Error("Failed to fetch sections");
      }

      const data = await response.json();

      // Filter sections by selected program
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
  };

  if (loading) {
    return (
      <div className='flex items-center justify-center p-8'>
        <p className='text-muted-foreground'>Loading sections...</p>
      </div>
    );
  }

  if (sections.length === 0) {
    return (
      <div className='flex items-center justify-center p-8'>
        <p className='text-muted-foreground'>
          No sections available for this program
        </p>
      </div>
    );
  }

  return (
    <div className='space-y-6 w-full'>
      <div>
        <h2 className='text-2xl font-semibold text-foreground mb-2'>
          Select a Section
        </h2>
        <p className='text-sm text-muted-foreground'>Choose your section</p>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
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
            <div className='flex flex-col items-center text-center gap-3'>
              <div className='flex h-14 w-14 items-center justify-center rounded-full bg-chart-2/10 shrink-0'>
                <Layers className='h-7 w-7 text-chart-2' />
              </div>

              <div className='w-full'>
                <h3 className='font-bold text-foreground text-xl group-hover:text-primary transition-colors'>
                  {section.name}
                </h3>
                <p className='text-xs text-muted-foreground mt-1.5 flex items-center justify-center gap-1'>
                  <Users className='h-3 w-3' />
                  Section
                </p>
              </div>
            </div>

            {section._count?.students !== undefined && (
              <div className='mt-4 pt-3 border-t border-border'>
                <div className='flex items-center justify-center text-xs text-muted-foreground'>
                  <span>{section._count.students} students enrolled</span>
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
