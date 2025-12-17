"use client";
import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useAssessment } from "./AssessmentContext";
import { SectionSelection } from "./section-selection";
import { CourseSelection } from "./course-selection";
import { InstructorsSelection } from "./instructors-selection";
import StudentSurveyPage from "./survey-form";
import { Button } from "../ui/button";
import {
  ChevronLeft,
  CheckCircle,
  Loader2,
  RefreshCw,
  AlertCircle,
} from "lucide-react";
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
  const [studentProgram, setStudentProgram] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [surveyActive, setSurveyActive] = useState(true);
  const [checkingSurvey, setCheckingSurvey] = useState(true);

  // Check survey status
  useEffect(() => {
    const checkSurveyStatus = async () => {
      try {
        setCheckingSurvey(true);
        const response = await fetch("/api/survey/status");

        if (response.ok) {
          const data = await response.json();
          setSurveyActive(data.isActive);
        }
      } catch (error) {
        console.error("Error checking survey status:", error);
      } finally {
        setCheckingSurvey(false);
      }
    };

    checkSurveyStatus();

    // Poll every 30 seconds to check if survey status changed
    // const interval = setInterval(checkSurveyStatus, 10000);

    // return () => clearInterval(interval);
  }, []);

  // Fetch student's program from their record
  useEffect(() => {
    const fetchStudentProgram = async () => {
      if (status === "authenticated" && session?.user) {
        try {
          console.log("Session user:", session.user);

          const userId = session.user.id || (session.user as any).sub;

          if (!userId) {
            throw new Error("User ID not found in session");
          }

          const userResponse = await fetch(`/api/create/user/${userId}`);

          if (!userResponse.ok) {
            const errorText = await userResponse.text();
            console.error("User fetch error:", errorText);
            throw new Error("Failed to fetch user data");
          }

          const userData = await userResponse.json();
          console.log("User data:", userData);

          if (!userData.studentId) {
            toast.error("Your account is not linked to a student record");
            setIsReady(true);
            return;
          }

          const response = await fetch(
            `/api/create/student/${userData.studentId}`
          );

          if (!response.ok) {
            const errorText = await response.text();
            console.error("Student fetch error:", errorText);
            throw new Error("Failed to fetch student data");
          }

          const studentData = await response.json();
          console.log("Student data:", studentData);

          if (studentData.program && studentData.programId) {
            setStudentProgram({
              id: studentData.programId,
              name: studentData.program.name,
            });

            updateSelection({
              studentId: userId,
              studentName: userData.fullName || "",
              programId: studentData.programId,
            });

            setIsReady(true);
          } else {
            toast.error("Your student record is missing a program assignment");
            setIsReady(true);
          }
        } catch (error) {
          console.error("Error fetching student program:", error);
          toast.error(
            error instanceof Error
              ? error.message
              : "Failed to load your program information"
          );
          setIsReady(true);
        }
      } else if (status === "unauthenticated") {
        window.location.href = "/auth/signin";
      }
    };

    fetchStudentProgram();
  }, [status, session?.user]);

  const steps = [
    { number: 1, name: "Section", completed: !!selection.sectionId },
    { number: 2, name: "Course", completed: !!selection.courseId },
    { number: 3, name: "Instructor", completed: !!selection.instructorId },
    { number: 4, name: "Survey", completed: false },
  ];

  const progress = ((currentStep - 1) / (steps.length - 1)) * 100;

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    toast.success("Assessment Submitted!", {
      description: "You can now evaluate another instructor.",
      duration: 5000,
    });

    const studentId = selection.studentId;
    const studentName = selection.studentName;
    const programId = selection.programId;

    resetSelection();

    updateSelection({
      studentId,
      studentName,
      programId,
    });
  };

  // Show loading state
  if (status === "loading" || !isReady || checkingSurvey) {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <div className='text-center space-y-4'>
          <Loader2 className='w-8 h-8 animate-spin mx-auto text-primary' />
          <p className='text-muted-foreground'>Loading...</p>
        </div>
      </div>
    );
  }

  // Show survey unavailable message
  if (!surveyActive) {
    return (
      <div className='flex items-center justify-center min-h-screen p-4'>
        <div className='max-w-md w-full space-y-6 text-center'>
          <div className='w-20 h-20 mx-auto bg-orange-100 dark:bg-orange-900 rounded-full flex items-center justify-center'>
            <AlertCircle className='w-10 h-10 text-orange-600 dark:text-orange-400' />
          </div>

          <div className='space-y-2'>
            <h2 className='text-2xl font-bold text-foreground'>
              Survey Not Available
            </h2>
            <p className='text-muted-foreground'>
              The evaluation survey is currently not available. Please check
              back later or contact your administrator.
            </p>
          </div>

          <div className='bg-muted rounded-lg p-4 space-y-2'>
            <p className='text-sm font-medium'>What you can do:</p>
            <ul className='text-sm text-muted-foreground text-left space-y-1'>
              <li>• Wait for the survey to be activated</li>
              <li>• Contact your administrator for more information</li>
              <li>• Check announcements for survey availability</li>
            </ul>
          </div>

          <Button
            variant='outline'
            onClick={() => window.location.reload()}
            className='gap-2'
          >
            <RefreshCw className='w-4 h-4' />
            Refresh Page
          </Button>
        </div>
      </div>
    );
  }

  // Show error state if student info not loaded
  if (!selection.studentId || !selection.programId) {
    return (
      <div className='flex items-center justify-center h-dvh'>
        <div className='text-center space-y-4 max-w-md'>
          <div className='w-16 h-16 mx-auto bg-red-100 rounded-full flex items-center justify-center'>
            <span className='text-red-600 text-2xl'>⚠️</span>
          </div>
          <h2 className='text-xl font-semibold'>Unable to Load Profile</h2>
          <p className='text-muted-foreground'>
            Your account is not properly configured. Please contact the
            administrator.
          </p>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </div>
      </div>
    );
  }

  return (
    <div className='h-dvh bg-transparent py-1 w-full max-w-225'>
      <div className='space-y-8'>
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
              <div className='flex flex-col gap-1 mt-2'>
                {selection.studentName && (
                  <p className='text-sm text-muted-foreground'>
                    Student:{" "}
                    <span className='font-medium'>{selection.studentName}</span>
                  </p>
                )}
                {studentProgram && (
                  <p className='text-sm text-muted-foreground'>
                    Program:{" "}
                    <span className='font-medium'>{studentProgram.name}</span>
                  </p>
                )}
              </div>
            </div>
            <div className='flex items-center gap-3'>
              {currentStep > 1 && currentStep < 4 && (
                <Button
                  variant='outline'
                  onClick={handleBack}
                  className='gap-2'
                >
                  <ChevronLeft className='w-4 h-4' />
                  Back
                </Button>
              )}
              {currentStep === 1 && selection.sectionId && (
                <Button
                  variant='outline'
                  onClick={() => {
                    const studentId = selection.studentId;
                    const studentName = selection.studentName;
                    const programId = selection.programId;

                    resetSelection();

                    updateSelection({
                      studentId,
                      studentName,
                      programId,
                    });
                  }}
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
        <div className='bg-card rounded-xl border border-border p-1'>
          {currentStep === 1 && <SectionSelection />}
          {currentStep === 2 && <CourseSelection />}
          {currentStep === 3 && <InstructorsSelection />}
          {currentStep === 4 && (
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
