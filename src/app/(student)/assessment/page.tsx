"use client";
import React from "react";
import { AssessmentProvider } from "@/components/student-side/AssessmentContext";
import AssessmentFlow from "@/components/student-side/AssessmentFlow";

export default function Assessment() {
  return (
    <AssessmentProvider>
      <AssessmentFlow />
    </AssessmentProvider>
  );
}
