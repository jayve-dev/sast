"use client";
import React from "react";
import { useAssessment } from "./AssessmentContext";
import { ProgramSelection } from "./program-selection";
import { SectionSelection } from "./section-selection";
import { CourseSelection } from "./course-selection";
import { InstructorsSelection } from "./instructors-selection";
import StudentSurveyPage from "./survey-form";
import { Button } from "../ui/button";
import { ChevronLeft, CheckCircle } from "lucide-react";
import { Progress } from "../ui/progress";

export default function AssessmentFlow() {
  const { selection, currentStep, setCurrentStep, resetSelection } =
    useAssessment();

  const steps = [
    { number: 1, name: "Program", completed: !!selection.programId },
    { number: 2, name: "Section", completed: !!selection.sectionId },
    { number: 3, name: "Course", completed: !!selection.courseId },
    { number: 4, name: "Instructor", completed: !!selection.instructorId },
    { number: 5, name: "Survey", completed: false },
  ];

  const progress = ((currentStep - 1) / (steps.length - 1)) * 100;

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className='min-h-screen bg-background p-6'>
      <div className='max-w-6xl mx-auto space-y-8'>
        {/* Header */}
        <div className='space-y-4'>
          <div className='flex items-center justify-between'>
            <div>
              <h1 className='text-3xl font-bold text-foreground'>
                Teacher Assessment
              </h1>
              <p className='text-muted-foreground mt-2'>
                Provide feedback for your instructor
              </p>
            </div>
            {currentStep > 1 && currentStep < 5 && (
              <Button variant='outline' onClick={handleBack} className='gap-2'>
                <ChevronLeft className='w-4 h-4' />
                Back
              </Button>
            )}
          </div>

          {/* Progress Bar */}
          <div className='space-y-3'>
            <Progress value={progress} className='h-2' />
            <div className='flex justify-between'>
              {steps.map((step) => (
                <div
                  key={step.number}
                  className={`flex items-center gap-2 ${
                    currentStep === step.number
                      ? "text-primary font-semibold"
                      : step.completed
                      ? "text-green-600"
                      : "text-muted-foreground"
                  }`}
                >
                  {step.completed ? (
                    <CheckCircle className='w-5 h-5' />
                  ) : (
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                        currentStep === step.number
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border"
                      }`}
                    >
                      {step.number}
                    </div>
                  )}
                  <span className='text-sm hidden md:inline'>{step.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className='bg-card rounded-xl border border-border p-6'>
          {currentStep === 1 && <ProgramSelection />}
          {currentStep === 2 && <SectionSelection />}
          {currentStep === 3 && <CourseSelection />}
          {currentStep === 4 && <InstructorsSelection />}
          {currentStep === 5 && (
            <StudentSurveyPage onComplete={resetSelection} />
          )}
        </div>
      </div>
    </div>
  );
}
