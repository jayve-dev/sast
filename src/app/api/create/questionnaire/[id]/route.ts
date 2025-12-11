import { NextResponse } from "next/server";
import { prisma } from "../../../../../../lib/db";

export async function DELETE(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { message: "Question ID is required" },
        { status: 400 }
      );
    }

    // Check if question exists
    const question = await prisma.question.findUnique({
      where: { id },
      include: {
        Option: true,
      },
    });

    if (!question) {
      return NextResponse.json(
        { message: "Question not found" },
        { status: 404 }
      );
    }

    // Delete all responses related to this question
    await prisma.response.deleteMany({
      where: { questionId: id },
    });

    // Delete all options related to this question
    await prisma.option.deleteMany({
      where: { questionId: id },
    });

    // Delete the question
    await prisma.question.delete({
      where: { id },
    });

    return NextResponse.json(
      { message: "Question deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Delete question error:", error);
    return NextResponse.json(
      { message: "Failed to delete question" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const { id } = params;
    const body = await req.json();
    const { question, categoryId } = body;

    if (!id) {
      return NextResponse.json(
        { message: "Question ID is required" },
        { status: 400 }
      );
    }

    if (!question || !categoryId) {
      return NextResponse.json(
        { message: "Question text and category are required" },
        { status: 400 }
      );
    }

    // Check if question exists
    const existingQuestion = await prisma.question.findUnique({
      where: { id },
    });

    if (!existingQuestion) {
      return NextResponse.json(
        { message: "Question not found" },
        { status: 404 }
      );
    }

    // Check if category exists
    const category = await prisma.category.findUnique({
      where: { id: categoryId },
    });

    if (!category) {
      return NextResponse.json(
        { message: "Category not found" },
        { status: 404 }
      );
    }

    // Update the question
    const updatedQuestion = await prisma.question.update({
      where: { id },
      data: {
        question,
        categoryId,
      },
      include: {
        Category: true,
        Option: true,
      },
    });

    return NextResponse.json(
      {
        message: "Question updated successfully",
        question: updatedQuestion,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Update question error:", error);
    return NextResponse.json(
      { message: "Failed to update question" },
      { status: 500 }
    );
  }
}
