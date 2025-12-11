"use client";
import React, { createContext, useContext, useState, ReactNode } from "react";

interface AssessmentSelection {
  programId: string | null;
  sectionId: string | null;
  courseId: string | null;
  instructorId: string | null;
  assignmentId: string | null;
}

interface AssessmentContextType {
  selection: AssessmentSelection;
  setProgram: (programId: string) => void;
  setSection: (sectionId: string) => void;
  setCourse: (courseId: string) => void;
  setInstructor: (instructorId: string, assignmentId: string) => void;
  resetSelection: () => void;
  currentStep: number;
  setCurrentStep: (step: number) => void;
}

const AssessmentContext = createContext<AssessmentContextType | undefined>(
  undefined
);

export const useAssessment = () => {
  const context = useContext(AssessmentContext);
  if (!context) {
    throw new Error("useAssessment must be used within AssessmentProvider");
  }
  return context;
};

export const AssessmentProvider = ({ children }: { children: ReactNode }) => {
  const [selection, setSelection] = useState<AssessmentSelection>({
    programId: null,
    sectionId: null,
    courseId: null,
    instructorId: null,
    assignmentId: null,
  });
  const [currentStep, setCurrentStep] = useState(1);

  const setProgram = (programId: string) => {
    setSelection({
      programId,
      sectionId: null,
      courseId: null,
      instructorId: null,
      assignmentId: null,
    });
    setCurrentStep(2);
  };

  const setSection = (sectionId: string) => {
    setSelection((prev) => ({
      ...prev,
      sectionId,
      courseId: null,
      instructorId: null,
      assignmentId: null,
    }));
    setCurrentStep(3);
  };

  const setCourse = (courseId: string) => {
    setSelection((prev) => ({
      ...prev,
      courseId,
      instructorId: null,
      assignmentId: null,
    }));
    setCurrentStep(4);
  };

  const setInstructor = (instructorId: string, assignmentId: string) => {
    setSelection((prev) => ({
      ...prev,
      instructorId,
      assignmentId,
    }));
    setCurrentStep(5);
  };

  const resetSelection = () => {
    setSelection({
      programId: null,
      sectionId: null,
      courseId: null,
      instructorId: null,
      assignmentId: null,
    });
    setCurrentStep(1);
  };

  return (
    <AssessmentContext.Provider
      value={{
        selection,
        setProgram,
        setSection,
        setCourse,
        setInstructor,
        resetSelection,
        currentStep,
        setCurrentStep,
      }}
    >
      {children}
    </AssessmentContext.Provider>
  );
};
