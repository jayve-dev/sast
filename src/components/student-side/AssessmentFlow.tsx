"use client";
import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useAssessment } from "./AssessmentContext";
import { ProgramSelection } from "./program-selection";
import { SectionSelection } from "./section-selection";
import { CourseSelection } from "./course-selection";
import { InstructorsSelection } from "./instructors-selection";
import StudentSurveyPage from "./survey-form";
import { Button } from "../ui/button";
import { ChevronLeft, CheckCircle, Loader2, RefreshCw } from "lucide-react";
import { Progress } from "../ui/progress";
import { toast } from "sonner";

export default function AssessmentFlow() {
  const { data: session, status } = useSession();
  const {
    selection,
    currentStep,
    setCurrentStep,
    resetSelection,
    updateSelection,
  } = useAssessment();
  const [isReady, setIsReady] = useState(false);

  // Set student info from session when component mounts
  useEffect(() => {
    if (status === "authenticated" && session?.user) {
      console.log("Setting student info:", session.user); // Debug log

      // Set student info in context
      updateSelection({
        studentId: session.user.id,
        studentName: session.user.fullName || "",
      });

      setIsReady(true);
    } else if (status === "unauthenticated") {
      // Redirect to login if not authenticated
      window.location.href = "/auth/signin";
    }
  }, [status, session?.user]);

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

  const handleComplete = () => {
    // Show success message and reset to step 1
    toast.success("Assessment Submitted!", {
      description: "You can now evaluate another instructor.",
      duration: 5000,
    });

    // Reset selection but keep student info
    resetSelection();
  };

  // Show loading state while checking authentication or setting up
  if (status === "loading" || !isReady || !selection.studentId) {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <div className='text-center space-y-4'>
          <Loader2 className='w-8 h-8 animate-spin mx-auto text-primary' />
          <p className='text-muted-foreground'>Loading...</p>
        </div>
      </div>
    );
  }

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
              {/* Show logged in student name */}
              {selection.studentName && (
                <p className='text-sm text-muted-foreground mt-1'>
                  Student:{" "}
                  <span className='font-medium'>{selection.studentName}</span>
                </p>
              )}
            </div>
            <div className='flex items-center gap-3'>
              {currentStep > 1 && currentStep < 5 && (
                <Button
                  variant='outline'
                  onClick={handleBack}
                  className='gap-2'
                >
                  <ChevronLeft className='w-4 h-4' />
                  Back
                </Button>
              )}
              {currentStep === 1 && selection.programId && (
                <Button
                  variant='outline'
                  onClick={resetSelection}
                  className='gap-2'
                  title='Start over with a new selection'
                >
                  <RefreshCw className='w-4 h-4' />
                  Reset
                </Button>
              )}
            </div>
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
            <StudentSurveyPage onComplete={handleComplete} />
          )}
        </div>

        {/* Info Card - Show on step 1 */}
        {currentStep === 1 && (
          <div className='bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-xl p-4'>
            <div className='flex items-start gap-3'>
              <div className='w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center shrink-0 mt-0.5'>
                <span className='text-white text-sm font-bold'>i</span>
              </div>
              <div className='text-sm'>
                <p className='font-semibold text-blue-900 dark:text-blue-100 mb-1'>
                  Multiple Assessments
                </p>
                <p className='text-blue-700 dark:text-blue-300'>
                  After completing an assessment, you'll be returned here to
                  evaluate another instructor. You can assess all your
                  instructors one by one.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
