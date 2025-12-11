"use client";
import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Button } from "../ui/button";
import { Loader2, RefreshCw, FileQuestion, Trash2, Edit } from "lucide-react";
import { Badge } from "../ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-dialog";
import { EditQuestionModal } from "./edit-question-modal";
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

interface QuestionsListProps {
  questions: Question[];
  loading: boolean;
  onRefresh: () => void;
}

export function QuestionsList({
  questions,
  loading,
  onRefresh,
}: QuestionsListProps) {
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [editQuestion, setEditQuestion] = useState<Question | null>(null);

  // Group questions by category
  const groupedQuestions = questions.reduce((acc, question) => {
    const categoryName = question.Category.name;
    if (!acc[categoryName]) {
      acc[categoryName] = [];
    }
    acc[categoryName].push(question);
    return acc;
  }, {} as Record<string, Question[]>);

  const handleDelete = async () => {
    if (!deleteId) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/create/questionnaire/${deleteId}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to delete question");
      }

      toast.success("Question deleted successfully");
      setDeleteId(null);
      onRefresh();
    } catch (error) {
      console.error("Delete error:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to delete question";
      toast.error(errorMessage);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleEditSuccess = () => {
    setEditQuestion(null);
    onRefresh();
  };

  if (loading) {
    return (
      <div className='flex items-center justify-center p-12'>
        <div className='text-center space-y-4'>
          <Loader2 className='w-8 h-8 animate-spin mx-auto text-primary' />
          <p className='text-muted-foreground'>Loading questions...</p>
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <Card>
        <CardContent className='flex flex-col items-center justify-center p-12'>
          <FileQuestion className='w-16 h-16 text-muted-foreground mb-4' />
          <h3 className='text-lg font-semibold text-foreground mb-2'>
            No Questions Yet
          </h3>
          <p className='text-sm text-muted-foreground text-center mb-4'>
            Create your first survey to start collecting feedback
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className='space-y-6'>
        <div className='flex items-center justify-between'>
          <div>
            <h2 className='text-xl font-semibold text-foreground'>
              All Questions
            </h2>
            <p className='text-sm text-muted-foreground'>
              {questions.length} questions across{" "}
              {Object.keys(groupedQuestions).length} categories
            </p>
          </div>
          <Button
            variant='outline'
            size='sm'
            onClick={onRefresh}
            className='gap-2'
          >
            <RefreshCw className='w-4 h-4' />
            Refresh
          </Button>
        </div>

        {Object.entries(groupedQuestions).map(
          ([categoryName, categoryQuestions]) => (
            <Card key={categoryName}>
              <CardHeader>
                <div className='flex items-center justify-between'>
                  <div>
                    <CardTitle className='text-lg'>{categoryName}</CardTitle>
                    <CardDescription>
                      {categoryQuestions.length} question
                      {categoryQuestions.length !== 1 ? "s" : ""}
                    </CardDescription>
                  </div>
                  <Badge variant='secondary'>{categoryQuestions.length}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className='space-y-4'>
                  {categoryQuestions.map((question, index) => (
                    <div
                      key={question.id}
                      className='p-4 border border-border rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors'
                    >
                      <div className='flex items-start justify-between gap-4'>
                        <div className='flex-1'>
                          <div className='flex items-start gap-3 mb-3'>
                            <span className='flex items-center justify-center w-7 h-7 rounded-full bg-primary/10 text-primary text-sm font-semibold shrink-0'>
                              {index + 1}
                            </span>
                            <p className='text-sm font-medium text-foreground flex-1'>
                              {question.question}
                            </p>
                          </div>

                          {/* Options */}
                          <div className='ml-10 space-y-2'>
                            <p className='text-xs font-medium text-muted-foreground mb-2'>
                              Response Options:
                            </p>
                            <div className='flex flex-wrap gap-2'>
                              {question.Option.sort(
                                (a, b) => b.value - a.value
                              ).map((option) => (
                                <Badge
                                  key={option.id}
                                  variant='outline'
                                  className='text-xs'
                                >
                                  {option.text} ({option.value})
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>

                        <div className='flex gap-2 shrink-0'>
                          <Button
                            variant='ghost'
                            size='icon'
                            onClick={() => setEditQuestion(question)}
                            className='text-primary hover:text-primary hover:bg-primary/10'
                          >
                            <Edit className='w-4 h-4' />
                          </Button>
                          <Button
                            variant='ghost'
                            size='icon'
                            onClick={() => setDeleteId(question.id)}
                            className='text-destructive hover:text-destructive hover:bg-destructive/10'
                          >
                            <Trash2 className='w-4 h-4' />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={deleteId !== null}
        onOpenChange={() => setDeleteId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Question</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this question? This action cannot
              be undone. All associated responses will also be deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className='bg-destructive hover:bg-destructive/90 text-destructive-foreground'
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit Question Modal */}
      <EditQuestionModal
        question={editQuestion}
        onClose={() => setEditQuestion(null)}
        onSuccess={handleEditSuccess}
      />
    </>
  );
}
