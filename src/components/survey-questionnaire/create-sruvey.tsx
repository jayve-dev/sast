"use client";
import Link from "next/link";
import type React from "react";
import { useState } from "react";
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
import { useRouter } from "next/navigation";
import { Plus, X, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

interface Question {
  id: string;
  category: string;
  text: string;
}

const questionCategories = [
  "Teaching Effectiveness",
  "Course Organization",
  "Student Engagement",
  "Assessment",
  "Learning Environment",
];

export function CreateSurveyForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [questions, setQuestions] = useState<Question[]>([
    { id: "1", category: "Teaching Effectiveness", text: "" },
  ]);

  const addQuestion = () => {
    const newId = (questions.length + 1).toString();
    setQuestions([
      ...questions,
      { id: newId, category: "Teaching Effectiveness", text: "" },
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

    const emptyQuestions = questions.filter((q) => !q.text.trim());
    if (emptyQuestions.length > 0) {
      toast.error("Incomplete Questions", {
        description: "Please fill in all question texts.",
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
            <div className='flex items-center gap-2'>
              <CheckCircle2 className='h-4 w-4 text-green-500' />
              <span>
                Auto-assigned to {result.assignedTo} teacher assignments
              </span>
            </div>
          </div>
        ),
      });

      setQuestions([{ id: "1", category: "Teaching Effectiveness", text: "" }]);

      setTimeout(() => {
        router.push("/questionnaire");
      }, 2000);
    } catch (error) {
      console.error("Submit error:", error);
      const errorMessage = error instanceof Error ? error : new Error("Unknown error");
      toast.error("Error", {
        description: errorMessage.message,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className='space-y-6 w-full'>
      <Card>
        <CardHeader>
          <div className='flex items-center justify-between'>
            <div>
              <CardTitle>Survey Questions</CardTitle>
              <CardDescription>
                Add questions for evaluation. Survey will be automatically
                assigned to all teachers.
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
                  value={question.category}
                  onValueChange={(value) =>
                    updateQuestion(question.id, "category", value)
                  }
                >
                  <SelectTrigger id={`category-${question.id}`}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {questionCategories.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
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
        <Link href='/questionnaire'>
          <Button type='button' variant='outline'>
            Cancel
          </Button>
        </Link>
        <Button type='submit' disabled={isSubmitting}>
          {isSubmitting ? "Creating..." : "Create Survey"}
        </Button>
      </div>
    </form>
  );
}
