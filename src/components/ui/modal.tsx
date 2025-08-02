import React from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface ModalProps {
    // isOpen: boolean;
    title?: string;
    description?: string;
    triggerText?: React.ReactNode;
    children? : React.ReactNode;
//     onConfirm: () => void;
//     onCancel: () => void;
}

const Modal = ({ title, description, triggerText,children }: ModalProps) => {
  return (
    <AlertDialog>
      <AlertDialogTrigger>{triggerText}</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>
          <div className="space-y-2">{children}</div>

          <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction>Continue</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export { Modal };
