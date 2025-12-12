import { NextResponse } from "next/server";
import { prisma } from "../../../../../lib/db";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { questions } = body;

    if (!questions || !Array.isArray(questions) || questions.length === 0) {
      return NextResponse.json(
        { message: "Questions array is required" },
        { status: 400 }
      );
    }

    // Validate all questions
    for (const question of questions) {
      if (!question.text || !question.text.trim()) {
        return NextResponse.json(
          { message: "All questions must have text" },
          { status: 400 }
        );
      }
      if (!question.categoryId) {
        return NextResponse.json(
          { message: "All questions must have a category" },
          { status: 400 }
        );
      }
    }

    // Define the Likert scale options (5-point scale)
    const likertOptions = [
      { text: "Strongly Disagree", value: 1 },
      { text: "Disagree", value: 2 },
      { text: "Neutral", value: 3 },
      { text: "Agree", value: 4 },
      { text: "Strongly Agree", value: 5 },
    ];

    // Create all questions with their options in a transaction
    const createdQuestions = await prisma.$transaction(
      questions.map((question: { text: string; categoryId: string }) =>
        prisma.question.create({
          data: {
            question: question.text.trim(),
            categoryId: question.categoryId,
            Option: {
              create: likertOptions.map((option) => ({
                text: option.text,
                value: option.value,
              })),
            },
          },
          include: {
            Option: true,
            Category: true,
          },
        })
      )
    );

    return NextResponse.json(
      {
        message: "Survey created successfully",
        questionsCreated: createdQuestions.length,
        questions: createdQuestions,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create questionnaire error:", error);

    // Better error logging
    if (error instanceof Error) {
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
    }

    return NextResponse.json(
      {
        message: "Failed to create survey",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const questions = await prisma.question.findMany({
      include: {
        Category: true,
        Option: {
          orderBy: {
            value: "desc",
          },
        },
      },
      orderBy: {
        Category: {
          name: "asc",
        },
      },
    });

    return NextResponse.json(questions, { status: 200 });
  } catch (error) {
    console.error("Failed to fetch questions:", error);
    return NextResponse.json(
      { message: "Failed to fetch questions" },
      { status: 500 }
    );
  }
}
