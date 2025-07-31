import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface AddModalProps {
    title?: string;
    children: React.ReactNode;
    triggerText?: string;
}

const AddModal = ({ title, children, triggerText }: AddModalProps) => {
  return (
    <Dialog>
      <DialogTrigger>{triggerText}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            {children}
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
};

export { AddModal };
