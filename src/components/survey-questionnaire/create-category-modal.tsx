"use client";
import React, { useState } from "react";
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
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface CreateCategoryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateCategoryModal({
  open,
  onOpenChange,
}: CreateCategoryModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error("Category name is required");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/create/category", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name.trim(),
          description: formData.description.trim() || null,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to create category");
      }

      toast.success("Category created successfully", {
        description: `"${formData.name}" has been added to the system.`,
      });

      // Reset form
      setFormData({
        name: "",
        description: "",
      });

      // Close modal
      onOpenChange(false);
    } catch (error) {
      console.error("Create category error:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to create category";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setFormData({
        name: "",
        description: "",
      });
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className='max-w-md'>
        <DialogHeader>
          <DialogTitle>Create New Category</DialogTitle>
          <DialogDescription>
            Add a new category to organize your survey questions
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className='space-y-4 py-4'>
            <div className='space-y-2'>
              <Label htmlFor='name'>
                Category Name <span className='text-destructive'>*</span>
              </Label>
              <Input
                id='name'
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder='e.g., Teaching Effectiveness'
                disabled={isSubmitting}
                required
              />
            </div>

            <div className='space-y-2'>
              <Label htmlFor='description'>Description (Optional)</Label>
              <Textarea
                id='description'
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder='Briefly describe this category...'
                rows={3}
                disabled={isSubmitting}
              />
            </div>

            <div className='bg-muted p-3 rounded-lg'>
              <p className='text-xs text-muted-foreground'>
                <strong>Examples of categories:</strong>
                <br />
                • Teaching Effectiveness
                <br />
                • Course Organization
                <br />
                • Student Engagement
                <br />• Assessment Methods
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              type='button'
              variant='outline'
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type='submit' disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className='w-4 h-4 mr-2 animate-spin' />
                  Creating...
                </>
              ) : (
                "Create Category"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
