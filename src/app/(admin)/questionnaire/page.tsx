"use client";
import React from "react";
import { SurveyHeader } from "@/components/survey-questionnaire/header";
import { Textarea } from "@/components/ui/textarea";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";

export default function Questionnaire() {
  return (
    <div className='w-full h-dvh'>
      <SurveyHeader addSurvey={() => {}} />

      
      <div className="w-full flex flex-row">
        <Textarea className='w-full' placeholder='Type your survey questions here...' />
        {/* <div className="flex flex-row">
          <Input className=" w-fit" type="radio" id="radio" />
        </div> */}
      </div>
    </div>
  );
}
