"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

export interface AssessmentSelection {
  sectionId: string;
  sectionName: string;
  courseId: string;
  courseName: string;
  instructorId: string;
  instructorName: string;
  assignmentId: string;
  studentId: string;
  studentName?: string;
  programId?: string;
}

interface AssessmentContextType {
  selection: AssessmentSelection;
  updateSelection: (data: Partial<AssessmentSelection>) => void;
  resetSelection: () => void;
  currentStep: number;
  setCurrentStep: (step: number) => void;
  setSection: (sectionId: string) => void;
  setCourse: (courseId: string) => void;
  setInstructor: (instructorId: string, assignmentId: string) => void;
}

const initialSelection: AssessmentSelection = {
  sectionId: "",
  sectionName: "",
  courseId: "",
  courseName: "",
  instructorId: "",
  instructorName: "",
  assignmentId: "",
  studentId: "",
  studentName: "",
  programId: "",
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
      programId: prev.programId, // Keep programId when resetting
    }));
    setCurrentStep(1);
  };

  const setSection = (sectionId: string) => {
    updateSelection({ sectionId });
    // Don't auto-advance step - let component handle it
  };

  const setCourse = (courseId: string) => {
    updateSelection({ courseId });
    // Don't auto-advance step - let component handle it
  };

  const setInstructor = (instructorId: string, assignmentId: string) => {
    updateSelection({ instructorId, assignmentId });
    // Move to survey step
    setCurrentStep(4);
  };

  return (
    <AssessmentContext.Provider
      value={{
        selection,
        updateSelection,
        resetSelection,
        currentStep,
        setCurrentStep,
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
