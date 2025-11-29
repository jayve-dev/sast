import { NextResponse } from "next/server";
import { prisma } from "../../../../../lib/db";

type QuestionInput = {
  text: string;
  category: string;
};

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { questions } = body;

    if (!questions || questions.length === 0) {
      return NextResponse.json(
        { message: "At least one question is required" },
        { status: 400 }
      );
    }

    const teacherAssignments = await prisma.teachersAssigned.findMany({
      include: {
        Teacher: true,
        Course: true,
        Section: true,
        Program: true,
      },
    });

    if (teacherAssignments.length === 0) {
      return NextResponse.json(
        { message: "No teacher assignments found" },
        { status: 404 }
      );
    }

    const categoryMap = new Map<string, string>();

    for (const q of questions) {
      if (!categoryMap.has(q.category)) {
        const category = await prisma.category.upsert({
          where: { name: q.category },
          update: {},
          create: { name: q.category },
        });
        categoryMap.set(q.category, category.id);
      }
    }

    const createdQuestions = await Promise.all(
      questions.map(async (q: QuestionInput) => {
        const categoryId = categoryMap.get(q.category)!;

        const question = await prisma.question.create({
          data: {
            question: q.text,
            type: "LIKERT",
            categoryId,
            Option: {
              create: [
                { text: "Strongly Disagree", value: 1 },
                { text: "Disagree", value: 2 },
                { text: "Neutral", value: 3 },
                { text: "Agree", value: 4 },
                { text: "Strongly Agree", value: 5 },
              ],
            },
          },
          include: {
            Option: true,
            Category: true,
          },
        });

        return question;
      })
    );

    return NextResponse.json(
      {
        message: "Survey created successfully",
        questionsCreated: createdQuestions.length,
        assignedTo: teacherAssignments.length,
        questions: createdQuestions,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(error);
    return new Response(
      JSON.stringify({ message: "Failed to create survey", error }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

export async function GET() {
  try {
    const questions = await prisma.question.findMany({
      include: {
        Category: true,
        Option: true,
      },
      orderBy: {
        Category: {
          name: "asc",
        },
      },
    });

    return NextResponse.json(questions);
  } catch (error) {
    console.error(error);
    return new Response(
      JSON.stringify({ message: "Failed to fetch questions", error }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
