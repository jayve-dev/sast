"use client";
import React from "react";
import { SurveyHeader } from "@/components/survey-questionnaire/header";
import { CreateSurveyForm } from "@/components/survey-questionnaire/create-sruvey";

export default function Questionnaire() {
  return (
    <div className='w-full h-dvh'>
      <SurveyHeader addSurvey={() => {}} />
    
      <div className="w-full flex flex-row">
        <CreateSurveyForm />
      </div>
    </div>
  );
}
