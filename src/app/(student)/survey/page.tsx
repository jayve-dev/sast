'use client';

import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Check, AlertCircle } from 'lucide-react';

type AnswerValue = string | number | string[];

interface Question {
  id: string;
  text: string;
  type: 'multiple-choice' | 'text' | 'rating' | 'checkbox';
  options?: string[];
  scale?: number;
  placeholder?: string;
}

interface Page {
  id: number;
  title: string;
  questions: Question[];
}

interface Survey {
  title: string;
  description: string;
  pages: Page[];
}

export default function StudentSurveyPage() {
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [answers, setAnswers] = useState<Record<string, AnswerValue>>({});

  const survey: Survey = {
    title: "Student Feedback Survey",
    description: "Help us improve your learning experience by sharing your thoughts and opinions.",
    pages: [
      {
        id: 1,
        title: "About Your Experience",
        questions: [
          {
            id: 'q1',
            text: 'How satisfied are you with the course content?',
            type: 'multiple-choice',
            options: ['Very Satisfied', 'Satisfied', 'Neutral', 'Dissatisfied', 'Very Dissatisfied']
          },
          {
            id: 'q2',
            text: 'What topics would you like to learn more about?',
            type: 'text',
            placeholder: 'Share your thoughts here...'
          }
        ]
      },
      {
        id: 2,
        title: "Learning Environment",
        questions: [
          {
            id: 'q3',
            text: 'The classroom environment is conducive to learning',
            type: 'rating',
            scale: 5
          },
          {
            id: 'q4',
            text: 'Which learning methods work best for you? (Select all that apply)',
            type: 'checkbox',
            options: ['Visual aids', 'Hands-on activities', 'Group discussions', 'Independent study', 'Online resources']
          }
        ]
      }
    ]
  };

  const currentPageData = survey.pages[currentPage];
  const totalPages = survey.pages.length;
  const progress = ((currentPage + 1) / totalPages) * 100;

  const handleAnswer = (questionId: string, value: AnswerValue) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const handleNext = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevious = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleSubmit = () => {
    alert('Survey submitted successfully! Thank you for your feedback.');
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 mb-6">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
            {survey.title}
          </h1>
          <p className="text-gray-600">
            {survey.description}
          </p>
          
          {/* Progress Bar */}
          <div className="mt-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-600">
                Page {currentPage + 1} of {totalPages}
              </span>
              <span className="text-sm font-medium text-indigo-600">
                {Math.round(progress)}% Complete
              </span>
            </div>
            <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>

        {/* Question Card */}
        <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 mb-6">
          <div className="mb-6">
            <div className="inline-block bg-indigo-100 text-indigo-700 px-4 py-1 rounded-full text-sm font-semibold mb-4">
              {currentPageData.title}
            </div>
          </div>

          <div className="space-y-8">
            {currentPageData.questions.map((question, index) => (
              <div key={question.id} className="pb-8 border-b border-gray-200 last:border-0 last:pb-0">
                <div className="flex gap-3 mb-4">
                  <span className="flex-shrink-0 w-8 h-8 bg-indigo-500 text-white rounded-full flex items-center justify-center font-semibold text-sm">
                    {index + 1}
                  </span>
                  <h3 className="text-lg font-semibold text-gray-800 flex-1">
                    {question.text}
                  </h3>
                </div>

                {/* Multiple Choice */}
                {question.type === 'multiple-choice' && question.options && (
                  <div className="space-y-2 ml-11">
                    {question.options.map((option) => (
                      <label
                        key={option}
                        className="flex items-center p-4 bg-gray-50 rounded-xl cursor-pointer hover:bg-indigo-50 transition-colors border-2 border-transparent has-[:checked]:border-indigo-500 has-[:checked]:bg-indigo-50"
                      >
                        <input
                          type="radio"
                          name={question.id}
                          value={option}
                          checked={answers[question.id] === option}
                          onChange={(e) => handleAnswer(question.id, e.target.value)}
                          className="w-5 h-5 text-indigo-600 focus:ring-indigo-500"
                        />
                        <span className="ml-3 text-gray-700 font-medium">{option}</span>
                      </label>
                    ))}
                  </div>
                )}

                {/* Text Input */}
                {question.type === 'text' && (
                  <div className="ml-11">
                    <textarea
                      value={answers[question.id] || ''}
                      onChange={(e) => handleAnswer(question.id, e.target.value)}
                      placeholder={question.placeholder}
                      rows={4}
                      className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring focus:ring-indigo-200 transition-all resize-none"
                    />
                  </div>
                )}

                {/* Rating */}
                {question.type === 'rating' && question.scale && (
                  <div className="ml-11">
                    <div className="flex gap-2">
                      {[...Array(question.scale)].map((_, i) => (
                        <button
                          key={i}
                          onClick={() => handleAnswer(question.id, i + 1)}
                          className={`w-14 h-14 rounded-xl font-bold text-lg transition-all ${
                            answers[question.id] === i + 1
                              ? 'bg-gradient-to-br from-indigo-500 to-purple-500 text-white shadow-lg scale-110'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          {i + 1}
                        </button>
                      ))}
                    </div>
                    <div className="flex justify-between mt-2 text-sm text-gray-500">
                      <span>Strongly Disagree</span>
                      <span>Strongly Agree</span>
                    </div>
                  </div>
                )}

                {/* Checkbox */}
                {question.type === 'checkbox' && question.options && (
                  <div className="space-y-2 ml-11">
                    {question.options.map((option) => (
                      <label
                        key={option}
                        className="flex items-center p-4 bg-gray-50 rounded-xl cursor-pointer hover:bg-indigo-50 transition-colors border-2 border-transparent has-[:checked]:border-indigo-500 has-[:checked]:bg-indigo-50"
                      >
                        <input
                          type="checkbox"
                          // Use Array.isArray to narrow the union type before using .includes
                          checked={Array.isArray(answers[question.id]) && (answers[question.id] as string[]).includes(option)}
                          onChange={(e) => {
                            // Narrow the type safely to an array (or start with an empty array)
                            const current = Array.isArray(answers[question.id]) ? [...(answers[question.id] as string[])] : [];
                            const updated = e.target.checked
                              ? [...current, option]
                              : current.filter((o: string) => o !== option);
                            handleAnswer(question.id, updated);
                          }}
                          className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500"
                        />
                        <span className="ml-3 text-gray-700 font-medium">{option}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center gap-4">
          <button
            onClick={handlePrevious}
            disabled={currentPage === 0}
            className="inline-flex items-center gap-2 px-6 py-3 bg-white text-gray-700 rounded-xl font-semibold shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-md"
          >
            <ChevronLeft size={20} />
            Previous
          </button>

          {currentPage < totalPages - 1 ? (
            <button
              onClick={handleNext}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all hover:scale-105"
            >
              Next
              <ChevronRight size={20} />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all hover:scale-105"
            >
              <Check size={20} />
              Submit Survey
            </button>
          )}
        </div>

        {/* Help Text */}
        <div className="mt-6 flex items-start gap-2 text-sm text-gray-600 bg-blue-50 p-4 rounded-xl">
          <AlertCircle size={20} className="flex-shrink-0 text-blue-500 mt-0.5" />
          <p>Your responses are confidential and will be used to improve the learning experience.</p>
        </div>
      </div>
    </div>
  );
}