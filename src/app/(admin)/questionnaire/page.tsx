"use client";
import React, { useState, useEffect } from "react";
import { SurveyHeader } from "@/components/survey-questionnaire/header";
import { CreateSurveyModal } from "@/components/survey-questionnaire/create-survey-modal";
import { QuestionsList } from "@/components/survey-questionnaire/questions-list";
import { toast } from "sonner";

interface Option {
  id: string;
  text: string;
  value: number;
}

interface Question {
  id: string;
  question: string;
  categoryId: string;
  Category: {
    id: string;
    name: string;
  };
  Option: Option[];
}

export default function Questionnaire() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    try {
      const response = await fetch("/api/survey/questions");

      if (!response.ok) {
        throw new Error("Failed to fetch questions");
      }

      const data = await response.json();

      // Flatten questions from categories
      const allQuestions = data.flatMap((category: any) =>
        category.questions.map((q: any) => ({
          id: q.id,
          question: q.text,
          categoryId: category.id,
          Category: {
            id: category.id,
            name: category.name,
          },
          Option: q.options,
        }))
      );

      setQuestions(allQuestions);
    } catch (error) {
      console.error("Error fetching questions:", error);
      toast.error("Failed to load questions");
      setQuestions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSurveyCreated = () => {
    setIsModalOpen(false);
    fetchQuestions(); // Refresh the questions list
  };

  return (
    <div className='w-full min-h-full px-6'>
      <SurveyHeader onAddSurvey={() => setIsModalOpen(true)} />

      <QuestionsList
        questions={questions}
        loading={loading}
        onRefresh={fetchQuestions}
      />

      <CreateSurveyModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        onSuccess={handleSurveyCreated}
      />
    </div>
  );
}
