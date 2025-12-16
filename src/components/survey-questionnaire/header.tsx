import React, { useState, useEffect } from "react";
import { Button } from "../ui/button";
import {
  Plus,
  FolderPlus,
  StopCircle,
  PlayCircle,
  Loader2,
} from "lucide-react";
import { CreateCategoryModal } from "./create-category-modal";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface SurveyHeaderProps {
  onAddSurvey: () => void;
}

const SurveyHeader = ({ onAddSurvey }: SurveyHeaderProps) => {
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isActive, setIsActive] = useState(true);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  useEffect(() => {
    fetchSurveyStatus();
  }, []);

  const fetchSurveyStatus = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/survey/status");

      if (!response.ok) {
        throw new Error("Failed to fetch survey status");
      }

      const data = await response.json();
      setIsActive(data.isActive);
    } catch (error) {
      console.error("Error fetching survey status:", error);
      toast.error("Failed to load survey status");
    } finally {
      setLoading(false);
    }
  };

  const toggleSurveyStatus = async () => {
    try {
      setUpdating(true);
      const newStatus = !isActive;

      const response = await fetch("/api/survey/status", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          isActive: newStatus,
          updatedBy: "admin", // You can get this from session if needed
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update survey status");
      }

      const data = await response.json();
      setIsActive(data.isActive);

      toast.success(
        newStatus ? "Survey has been activated" : "Survey has been deactivated",
        {
          description: newStatus
            ? "Students can now access the evaluation."
            : "Students will see 'Survey not available' message.",
        }
      );
    } catch (error) {
      console.error("Error updating survey status:", error);
      toast.error("Failed to update survey status");
    } finally {
      setUpdating(false);
      setShowConfirmDialog(false);
    }
  };

  const handleToggleClick = () => {
    setShowConfirmDialog(true);
  };

  return (
    <>
      <div className='mb-8'>
        <div className='flex items-center justify-between'>
          <div>
            <h1 className='text-3xl font-bold text-foreground mb-2'>
              Survey Questionnaire
            </h1>
            <p className='text-muted-foreground'>
              Manage evaluation questions and surveys
            </p>
          </div>
          <div className='flex items-center gap-3'>
            <Button
              onClick={() => setIsCategoryModalOpen(true)}
              variant='outline'
              className='gap-2'
            >
              <FolderPlus className='h-4 w-4' />
              Add Category
            </Button>
            <Button onClick={onAddSurvey} className='gap-2'>
              <Plus className='h-4 w-4' />
              Create Survey
            </Button>
          </div>
        </div>

        {/* Survey Status Toggle */}
        <div className='mt-5 flex items-center gap-3'>
          <Button
            onClick={handleToggleClick}
            disabled={loading || updating}
            className={`gap-2 border-2 ${
              isActive
                ? "bg-red-600 hover:bg-red-700 border-red-800"
                : "bg-green-600 hover:bg-green-700 border-green-800"
            }`}
          >
            {updating ? (
              <>
                <Loader2 className='h-4 w-4 animate-spin' />
                Updating...
              </>
            ) : isActive ? (
              <>
                <StopCircle className='h-4 w-4' />
                STOP SURVEY
              </>
            ) : (
              <>
                <PlayCircle className='h-4 w-4' />
                START SURVEY
              </>
            )}
          </Button>

          <div
            className={`flex items-center gap-2 px-3 py-1 rounded-md text-sm font-medium ${
              isActive
                ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
                : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100"
            }`}
          >
            <div
              className={`w-2 h-2 rounded-full ${
                isActive ? "bg-green-600" : "bg-red-600"
              } animate-pulse`}
            />
            {isActive ? "Survey Active" : "Survey Inactive"}
          </div>
        </div>
      </div>

      <CreateCategoryModal
        open={isCategoryModalOpen}
        onOpenChange={setIsCategoryModalOpen}
      />

      {/* Confirmation Dialog */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {isActive ? "Stop Survey?" : "Start Survey?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {isActive ? (
                <>
                  This will prevent students from accessing the evaluation
                  survey. They will see a "Survey not available" message
                  instead.
                  <br />
                  <br />
                  Students can still log in to their accounts.
                </>
              ) : (
                <>
                  This will allow students to access and complete the evaluation
                  survey.
                  <br />
                  <br />
                  Make sure all questions and categories are properly
                  configured.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={toggleSurveyStatus}
              className={
                isActive
                  ? "bg-red-600 hover:bg-red-700"
                  : "bg-green-600 hover:bg-green-700"
              }
            >
              {isActive ? "Stop Survey" : "Start Survey"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export { SurveyHeader };
