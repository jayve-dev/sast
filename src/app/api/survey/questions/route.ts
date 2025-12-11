import { NextResponse } from "next/server";
import { prisma } from "../../../../../lib/db";

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      include: {
        Question: {
          include: {
            Option: {
              orderBy: {
                value: "desc",
              },
            },
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    });

    // Transform the data to match the expected format in the frontend
    const transformedCategories = categories.map((category) => ({
      id: category.id,
      name: category.name,
      description: category.description,
      questions: category.Question.map((question) => ({
        id: question.id,
        text: question.question,
        categoryId: question.categoryId,
        options: question.Option.map((option) => ({
          id: option.id,
          text: option.text,
          value: option.value,
        })),
      })),
    }));

    return NextResponse.json(transformedCategories, { status: 200 });
  } catch (error) {
    console.error("Failed to fetch survey questions:", error);
    return NextResponse.json(
      { message: "Failed to fetch survey questions" },
      { status: 500 }
    );
  }
}
