"use client";
import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

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

interface Category {
  id: string;
  name: string;
}

interface EditQuestionModalProps {
  question: Question | null;
  onClose: () => void;
  onSuccess: () => void;
}

export function EditQuestionModal({
  question,
  onClose,
  onSuccess,
}: EditQuestionModalProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [formData, setFormData] = useState({
    question: "",
    categoryId: "",
  });

  useEffect(() => {
    if (question) {
      setFormData({
        question: question.question,
        categoryId: question.categoryId,
      });
      fetchCategories();
    }
  }, [question]);

  const fetchCategories = async () => {
    setLoadingCategories(true);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question) return;

    if (!formData.question.trim()) {
      toast.error("Please enter a question");
      return;
    }

    if (!formData.categoryId) {
      toast.error("Please select a category");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/create/questionnaire/${question.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to update question");
      }

      toast.success("Question updated successfully");
      onSuccess();
    } catch (error) {
      console.error("Update error:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to update question";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={question !== null} onOpenChange={onClose}>
      <DialogContent className='max-w-2xl'>
        <DialogHeader>
          <DialogTitle>Edit Question</DialogTitle>
          <DialogDescription>
            Update the question text and category
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className='space-y-4 py-4'>
            <div className='space-y-2'>
              <Label htmlFor='category'>Category</Label>
              {loadingCategories ? (
                <div className='flex items-center gap-2 text-sm text-muted-foreground'>
                  <Loader2 className='w-4 h-4 animate-spin' />
                  Loading categories...
                </div>
              ) : (
                <Select
                  value={formData.categoryId}
                  onValueChange={(value) =>
                    setFormData({ ...formData, categoryId: value })
                  }
                >
                  <SelectTrigger id='category'>
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
              )}
            </div>

            <div className='space-y-2'>
              <Label htmlFor='question'>Question Text</Label>
              <Textarea
                id='question'
                value={formData.question}
                onChange={(e) =>
                  setFormData({ ...formData, question: e.target.value })
                }
                rows={4}
                placeholder='Enter the question text'
              />
            </div>

            {question && (
              <div className='bg-muted p-3 rounded-lg'>
                <p className='text-xs text-muted-foreground'>
                  <strong>Note:</strong> This question uses the following rating
                  scale:
                </p>
                <div className='flex flex-wrap gap-2 mt-2'>
                  {question.Option.sort((a, b) => b.value - a.value).map(
                    (option) => (
                      <span
                        key={option.id}
                        className='text-xs bg-background px-2 py-1 rounded border'
                      >
                        {option.text} ({option.value})
                      </span>
                    )
                  )}
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              type='button'
              variant='outline'
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type='submit' disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className='w-4 h-4 mr-2 animate-spin' />
                  Updating...
                </>
              ) : (
                "Update Question"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
