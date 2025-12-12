import React, { useState } from "react";
import { Button } from "../ui/button";
import { Plus, FolderPlus } from "lucide-react";
import { CreateCategoryModal } from "./create-category-modal";

interface SurveyHeaderProps {
  onAddSurvey: () => void;
}

const SurveyHeader = ({ onAddSurvey }: SurveyHeaderProps) => {
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);

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
      </div>

      <CreateCategoryModal
        open={isCategoryModalOpen}
        onOpenChange={setIsCategoryModalOpen}
      />
    </>
  );
};

export { SurveyHeader };
