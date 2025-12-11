"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

export interface AssessmentSelection {
  programId: string;
  programName: string;
  sectionId: string;
  sectionName: string;
  courseId: string;
  courseName: string;
  instructorId: string;
  instructorName: string;
  assignmentId: string;
  studentId: string;
  studentName?: string;
}

interface AssessmentContextType {
  selection: AssessmentSelection;
  updateSelection: (data: Partial<AssessmentSelection>) => void;
  resetSelection: () => void;
  currentStep: number;
  setCurrentStep: (step: number) => void;
  setProgram: (programId: string) => void;
  setSection: (sectionId: string) => void;
  setCourse: (courseId: string) => void;
  setInstructor: (instructorId: string, assignmentId: string) => void;
}

const initialSelection: AssessmentSelection = {
  programId: "",
  programName: "",
  sectionId: "",
  sectionName: "",
  courseId: "",
  courseName: "",
  instructorId: "",
  instructorName: "",
  assignmentId: "",
  studentId: "",
  studentName: "",
};

const AssessmentContext = createContext<AssessmentContextType | undefined>(
  undefined
);

export function AssessmentProvider({ children }: { children: ReactNode }) {
  const [selection, setSelection] =
    useState<AssessmentSelection>(initialSelection);
  const [currentStep, setCurrentStep] = useState(1);

  const updateSelection = (data: Partial<AssessmentSelection>) => {
    setSelection((prev) => ({ ...prev, ...data }));
  };

  const resetSelection = () => {
    setSelection((prev) => ({
      ...initialSelection,
      studentId: prev.studentId, // Keep studentId when resetting
      studentName: prev.studentName, // Keep studentName when resetting
    }));
    setCurrentStep(1);
  };

  const setProgram = (programId: string) => {
    updateSelection({ programId });
    setCurrentStep(2);
  };

  const setSection = (sectionId: string) => {
    updateSelection({ sectionId });
    setCurrentStep(3);
  };

  const setCourse = (courseId: string) => {
    updateSelection({ courseId });
    setCurrentStep(4);
  };

  const setInstructor = (instructorId: string, assignmentId: string) => {
    updateSelection({ instructorId, assignmentId });
    setCurrentStep(5);
  };

  return (
    <AssessmentContext.Provider
      value={{
        selection,
        updateSelection,
        resetSelection,
        currentStep,
        setCurrentStep,
        setProgram,
        setSection,
        setCourse,
        setInstructor,
      }}
    >
      {children}
    </AssessmentContext.Provider>
  );
}

export function useAssessment() {
  const context = useContext(AssessmentContext);
  if (context === undefined) {
    throw new Error("useAssessment must be used within an AssessmentProvider");
  }
  return context;
}
