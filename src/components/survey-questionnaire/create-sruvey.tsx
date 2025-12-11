"use client";
import type React from "react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, X, CheckCircle2, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface Question {
  id: string;
  categoryId: string;
  text: string;
}

interface Category {
  id: string;
  name: string;
  description: string | null;
}

interface CreateSurveyFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export function CreateSurveyForm({
  onSuccess,
  onCancel,
}: CreateSurveyFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [questions, setQuestions] = useState<Question[]>([
    { id: "1", categoryId: "", text: "" },
  ]);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/create/category");
      if (!response.ok) {
        throw new Error("Failed to fetch categories");
      }
      const data = await response.json();
      setCategories(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching categories:", error);
      toast.error("Failed to load categories");
    } finally {
      setLoadingCategories(false);
    }
  };

  const addQuestion = () => {
    const newId = (questions.length + 1).toString();
    setQuestions([
      ...questions,
      { id: newId, categoryId: categories[0]?.id || "", text: "" },
    ]);
  };

  const removeQuestion = (id: string) => {
    if (questions.length > 1) {
      setQuestions(questions.filter((q) => q.id !== id));
    }
  };

  const updateQuestion = (id: string, field: keyof Question, value: string) => {
    setQuestions(
      questions.map((q) => (q.id === id ? { ...q, [field]: value } : q))
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const emptyQuestions = questions.filter(
      (q) => !q.text.trim() || !q.categoryId
    );
    if (emptyQuestions.length > 0) {
      toast.error("Incomplete Questions", {
        description: "Please fill in all question texts and select categories.",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/create/questionnaire", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questions }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to create survey");
      }

      toast.success("Survey Created Successfully", {
        description: (
          <div className='flex flex-col gap-2'>
            <div className='flex items-center gap-2'>
              <CheckCircle2 className='h-4 w-4 text-green-500' />
              <span>{result.questionsCreated} questions created</span>
            </div>
          </div>
        ),
      });

      setQuestions([
        { id: "1", categoryId: categories[0]?.id || "", text: "" },
      ]);
      onSuccess();
    } catch (error) {
      console.error("Submit error:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      toast.error("Error", {
        description: errorMessage,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loadingCategories) {
    return (
      <div className='flex items-center justify-center p-12'>
        <div className='text-center space-y-4'>
          <Loader2 className='w-8 h-8 animate-spin mx-auto text-primary' />
          <p className='text-muted-foreground'>Loading categories...</p>
        </div>
      </div>
    );
  }

  if (categories.length === 0) {
    return (
      <div className='flex items-center justify-center p-12'>
        <div className='text-center space-y-4'>
          <p className='text-muted-foreground'>
            No categories available. Please create a category first.
          </p>
          <Button onClick={onCancel} variant='outline'>
            Close
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className='space-y-6'>
      <Card>
        <CardHeader>
          <div className='flex items-center justify-between'>
            <div>
              <CardTitle>Survey Questions</CardTitle>
              <CardDescription>
                Add questions for evaluation survey
              </CardDescription>
            </div>
            <Button
              type='button'
              variant='outline'
              size='sm'
              onClick={addQuestion}
            >
              <Plus className='h-4 w-4 mr-2' />
              Add Question
            </Button>
          </div>
        </CardHeader>
        <CardContent className='space-y-6'>
          {questions.map((question, index) => (
            <div
              key={question.id}
              className='space-y-3 p-4 border border-border rounded-lg'
            >
              <div className='flex items-center justify-between'>
                <Label className='text-base font-medium'>
                  Question {index + 1}
                </Label>
                {questions.length > 1 && (
                  <Button
                    type='button'
                    variant='ghost'
                    size='sm'
                    onClick={() => removeQuestion(question.id)}
                  >
                    <X className='h-4 w-4' />
                  </Button>
                )}
              </div>

              <div className='space-y-2'>
                <Label htmlFor={`category-${question.id}`}>Category</Label>
                <Select
                  value={question.categoryId}
                  onValueChange={(value) =>
                    updateQuestion(question.id, "categoryId", value)
                  }
                >
                  <SelectTrigger id={`category-${question.id}`}>
                    <SelectValue placeholder='Select a category' />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className='space-y-2'>
                <Label htmlFor={`text-${question.id}`}>Question Text</Label>
                <Textarea
                  id={`text-${question.id}`}
                  placeholder='Enter the question text'
                  value={question.text}
                  onChange={(e) =>
                    updateQuestion(question.id, "text", e.target.value)
                  }
                  rows={2}
                />
              </div>
            </div>
          ))}

          <div className='bg-muted p-4 rounded-lg'>
            <p className='text-sm text-muted-foreground'>
              <strong>Note:</strong> Each question will use a 5-point Likert
              scale:
              <br />
              Strongly Disagree (1) → Disagree (2) → Neutral (3) → Agree (4) →
              Strongly Agree (5)
            </p>
          </div>
        </CardContent>
      </Card>

      <div className='flex items-center justify-end gap-4'>
        <Button type='button' variant='outline' onClick={onCancel}>
          Cancel
        </Button>
        <Button type='submit' disabled={isSubmitting}>
          {isSubmitting ? "Creating..." : "Create Survey"}
        </Button>
      </div>
    </form>
  );
}
