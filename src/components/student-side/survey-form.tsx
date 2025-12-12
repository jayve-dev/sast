"use client";

import React, { useState, useEffect } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Check,
  AlertCircle,
  Loader2,
  MessageSquare,
} from "lucide-react";
import { useAssessment } from "./AssessmentContext";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";

interface Option {
  id: string;
  text: string;
  value: number;
}

interface Question {
  id: string;
  text: string;
  categoryId: string;
  options: Option[];
}

interface Category {
  id: string;
  name: string;
  description: string | null;
  questions: Question[];
}

interface StudentSurveyPageProps {
  onComplete: () => void;
}

export default function StudentSurveyPage({
  onComplete,
}: StudentSurveyPageProps) {
  const { selection } = useAssessment();
  const [categories, setCategories] = useState<Category[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuggestion, setShowSuggestion] = useState(false);
  const [suggestion, setSuggestion] = useState("");

  useEffect(() => {
    fetchSurveyData();
  }, []);

  const fetchSurveyData = async () => {
    try {
      const response = await fetch("/api/survey/questions");

      if (!response.ok) {
        throw new Error("Failed to fetch survey questions");
      }

      const data = await response.json();

      console.log("Fetched data:", data);

      // Transform the data to match the expected format
      const transformedCategories = Array.isArray(data)
        ? data.map((category: any) => ({
            id: category.id,
            name: category.name,
            description: category.description,
            questions: Array.isArray(category.questions)
              ? category.questions.map((q: any) => ({
                  id: q.id,
                  text: q.text,
                  categoryId: q.categoryId || category.id,
                  options: Array.isArray(q.options)
                    ? q.options.map((opt: any) => ({
                        id: opt.id,
                        text: opt.text,
                        value: opt.value,
                      }))
                    : [],
                }))
              : [],
          }))
        : [];

      console.log("Transformed categories:", transformedCategories);

      setCategories(transformedCategories);
    } catch (error) {
      console.error("Error fetching survey:", error);
      toast.error("Failed to load survey questions");
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  const currentCategory = categories[currentPage];
  const totalPages = categories.length;
  const progress = totalPages > 0 ? ((currentPage + 1) / totalPages) * 100 : 0;

  // Calculate total questions and answered questions
  const totalQuestions = categories.reduce(
    (sum, cat) => sum + cat.questions.length,
    0
  );
  const answeredQuestions = Object.keys(answers).length;

  const handleAnswer = (questionId: string, optionId: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: optionId }));
  };

  const handleNext = () => {
    // Check if all questions on current page are answered
    const unansweredQuestions = currentCategory.questions.filter(
      (q) => !answers[q.id]
    );

    if (unansweredQuestions.length > 0) {
      toast.error("Please answer all questions before proceeding");
      return;
    }

    if (currentPage < totalPages - 1) {
      setCurrentPage(currentPage + 1);
    } else {
      // If this is the last page, show suggestion section
      setShowSuggestion(true);
      // Scroll to top smoothly
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handlePrevious = () => {
    if (showSuggestion) {
      setShowSuggestion(false);
    } else if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleSubmit = async () => {
    // Validate all questions are answered
    if (answeredQuestions < totalQuestions) {
      toast.error("Please answer all questions before submitting");
      return;
    }

    // Validate studentId exists
    if (!selection.studentId) {
      toast.error("Student information not found. Please refresh the page.");
      console.error("Missing studentId in selection:", selection);
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        assignmentId: selection.assignmentId,
        teacherId: selection.instructorId,
        programId: selection.programId,
        sectionId: selection.sectionId,
        courseId: selection.courseId,
        studentId: selection.studentId,
        responses: Object.entries(answers).map(([questionId, optionId]) => ({
          questionId,
          optionId,
        })),
        suggestion: suggestion.trim() || null, // Include suggestion
      };

      console.log("Submitting payload:", payload);

      const response = await fetch("/api/create/student/submit-assessment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      // Check if response is JSON
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const text = await response.text();
        console.error("Response is not JSON:", text);
        throw new Error("Server returned invalid response");
      }

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to submit assessment");
      }

      toast.success("Assessment submitted successfully!");

      // Clear answers and suggestion
      setAnswers({});
      setSuggestion("");
      setShowSuggestion(false);
      setCurrentPage(0);

      // Call onComplete which will reset and go back to step 1
      onComplete();
    } catch (error) {
      console.error("Submit error:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to submit assessment";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className='flex items-center justify-center p-12'>
        <div className='text-center space-y-4'>
          <Loader2 className='w-8 h-8 animate-spin mx-auto text-primary' />
          <p className='text-muted-foreground'>Loading survey questions...</p>
        </div>
      </div>
    );
  }

  if (categories.length === 0) {
    return (
      <div className='flex items-center justify-center p-12'>
        <div className='text-center space-y-4'>
          <AlertCircle className='w-12 h-12 mx-auto text-muted-foreground' />
          <div>
            <h3 className='text-lg font-semibold text-foreground mb-2'>
              No Survey Available
            </h3>
            <p className='text-sm text-muted-foreground'>
              There are no survey questions available at this time.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen w-full bg-linear-to-br from-blue-50 via-indigo-50 to-purple-50 p-4 md:p-8'>
      <div className='max-w-4xl mx-auto'>
        {/* Header */}
        <div className='bg-white rounded-2xl shadow-lg p-6 md:p-8 mb-6'>
          <h1 className='text-3xl md:text-4xl font-bold text-gray-800 mb-2'>
            Teacher Evaluation Survey
          </h1>
          <p className='text-gray-600'>
            Please provide honest feedback to help improve the teaching quality
            and learning experience.
          </p>

          {/* Progress Bar */}
          <div className='mt-6'>
            <div className='flex justify-between items-center mb-2'>
              <span className='text-sm font-medium text-gray-600'>
                {showSuggestion
                  ? "Feedback & Suggestions"
                  : `Category ${currentPage + 1} of ${totalPages}`}
              </span>
              <span className='text-sm font-medium text-indigo-600'>
                {answeredQuestions} / {totalQuestions} questions answered
              </span>
            </div>
            <div className='h-3 bg-gray-200 rounded-full overflow-hidden'>
              <div
                className='h-full bg-linear-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-500 ease-out'
                style={{
                  width: showSuggestion ? "100%" : `${progress}%`,
                }}
              />
            </div>
          </div>
        </div>

        {/* Suggestion Card - Shows after all questions */}
        {showSuggestion ? (
          <div className='bg-white rounded-2xl shadow-lg p-6 md:p-8 mb-6'>
            <div className='mb-6'>
              <div className='flex items-center gap-3 mb-4'>
                <div className='w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center'>
                  <MessageSquare className='w-6 h-6 text-blue-600' />
                </div>
                <div>
                  <h2 className='text-2xl font-bold text-gray-800'>
                    Feedback & Suggestions
                  </h2>
                  <p className='text-sm text-gray-600'>
                    Share your thoughts (Optional)
                  </p>
                </div>
              </div>
              <p className='text-gray-600 text-sm'>
                Your feedback helps us improve the teaching experience. Feel
                free to share any additional comments, suggestions, or concerns.
              </p>
            </div>

            <div className='space-y-4'>
              <Textarea
                value={suggestion}
                onChange={(e) => setSuggestion(e.target.value)}
                placeholder='Write your feedback or suggestions here... (optional)'
                className='min-h-[200px] resize-none text-base p-4 border-2 border-gray-200 focus:border-indigo-500 rounded-xl'
                maxLength={1000}
              />
              <div className='flex justify-between items-center text-sm'>
                <p className='text-gray-500'>
                  Your feedback is anonymous and confidential
                </p>
                <p className='text-gray-600'>
                  {suggestion.length} / 1000 characters
                </p>
              </div>
            </div>
          </div>
        ) : (
          /* Question Card */
          <div className='bg-white rounded-2xl shadow-lg p-6 md:p-8 mb-6'>
            <div className='mb-6'>
              <div className='inline-block bg-indigo-100 text-indigo-700 px-4 py-2 rounded-full text-sm font-semibold mb-2'>
                {currentCategory.name}
              </div>
              {currentCategory.description && (
                <p className='text-sm text-gray-600 mt-2'>
                  {currentCategory.description}
                </p>
              )}
            </div>

            <div className='space-y-8'>
              {currentCategory.questions.length > 0 ? (
                currentCategory.questions.map((question, index) => (
                  <div
                    key={question.id}
                    className='pb-8 border-b border-gray-200 last:border-0 last:pb-0'
                  >
                    <div className='flex gap-3 mb-4'>
                      <span className='shrink-0 w-8 h-8 bg-indigo-500 text-white rounded-full flex items-center justify-center font-semibold text-sm'>
                        {index + 1}
                      </span>
                      <h3 className='text-lg font-semibold text-gray-800 flex-1'>
                        {question.text}
                      </h3>
                      {answers[question.id] && (
                        <Check className='w-5 h-5 text-green-500 shrink-0' />
                      )}
                    </div>

                    {/* Rating Options */}
                    <div className='ml-11 space-y-2'>
                      {question.options && question.options.length > 0 ? (
                        question.options
                          .sort((a, b) => b.value - a.value)
                          .map((option) => (
                            <label
                              key={option.id}
                              className={`flex items-center p-4 rounded-xl cursor-pointer transition-all border-2 ${
                                answers[question.id] === option.id
                                  ? "border-indigo-500 bg-indigo-50 shadow-md"
                                  : "border-gray-200 bg-gray-50 hover:bg-indigo-50 hover:border-indigo-200"
                              }`}
                            >
                              <input
                                type='radio'
                                name={question.id}
                                value={option.id}
                                checked={answers[question.id] === option.id}
                                onChange={(e) =>
                                  handleAnswer(question.id, e.target.value)
                                }
                                className='w-5 h-5 text-indigo-600 focus:ring-indigo-500'
                              />
                              <div className='ml-3 flex-1 flex items-center justify-between'>
                                <span className='text-gray-700 font-medium'>
                                  {option.text}
                                </span>
                                <span
                                  className={`text-sm font-semibold px-2.5 py-1 rounded-full ${
                                    answers[question.id] === option.id
                                      ? "bg-indigo-500 text-white"
                                      : "bg-gray-200 text-gray-600"
                                  }`}
                                >
                                  {option.value}
                                </span>
                              </div>
                            </label>
                          ))
                      ) : (
                        <p className='text-sm text-red-500'>
                          No options available for this question
                        </p>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className='text-center text-gray-500 py-8'>
                  No questions available in this category
                </div>
              )}
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className='flex justify-between items-center gap-4'>
          <button
            onClick={handlePrevious}
            disabled={currentPage === 0 && !showSuggestion}
            className='inline-flex items-center gap-2 px-6 py-3 bg-white text-gray-700 rounded-xl font-semibold shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-md'
          >
            <ChevronLeft size={20} />
            Previous
          </button>

          {showSuggestion ? (
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || answeredQuestions < totalQuestions}
              className='inline-flex items-center gap-2 px-6 py-3 bg-linear-to-r from-green-500 to-emerald-500 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100'
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={20} className='animate-spin' />
                  Submitting...
                </>
              ) : (
                <>
                  <Check size={20} />
                  Submit Survey
                </>
              )}
            </button>
          ) : (
            <button
              onClick={handleNext}
              disabled={currentCategory.questions.some((q) => !answers[q.id])}
              className='inline-flex items-center gap-2 px-6 py-3 bg-linear-to-r from-indigo-500 to-purple-500 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100'
            >
              {currentPage === totalPages - 1 ? "Continue" : "Next"}
              <ChevronRight size={20} />
            </button>
          )}
        </div>

        {/* Help Text */}
        <div className='mt-6 flex items-start gap-2 text-sm text-gray-600 bg-blue-50 p-4 rounded-xl'>
          <AlertCircle size={20} className='shrink-0 text-blue-500 mt-0.5' />
          <p>
            Your responses are confidential and will be used solely to improve
            teaching quality. Please answer all questions honestly.
          </p>
        </div>

        {/* Answer Summary */}
        <div className='mt-4 bg-white rounded-xl p-4 shadow-sm'>
          <div className='flex items-center justify-between text-sm'>
            <span className='text-gray-600'>Progress</span>
            <span className='font-semibold text-gray-800'>
              {totalQuestions > 0
                ? Math.round((answeredQuestions / totalQuestions) * 100)
                : 0}
              %
            </span>
          </div>
          <div className='mt-2 h-2 bg-gray-200 rounded-full overflow-hidden'>
            <div
              className='h-full bg-green-500 rounded-full transition-all duration-300'
              style={{
                width: `${
                  totalQuestions > 0
                    ? (answeredQuestions / totalQuestions) * 100
                    : 0
                }%`,
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export { StudentSurveyPage };
