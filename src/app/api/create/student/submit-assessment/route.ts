import { NextResponse } from "next/server";
import { prisma } from "../../../../../../lib/db";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      assignmentId,
      teacherId,
      programId,
      sectionId,
      courseId,
      studentId,
      responses,
      suggestion, // New field
    } = body;

    console.log("Received submission:", {
      assignmentId,
      teacherId,
      studentId,
      responseCount: responses?.length,
      hasSuggestion: !!suggestion,
    });

    // Validate required fields
    if (
      !assignmentId ||
      !teacherId ||
      !studentId ||
      !responses ||
      !Array.isArray(responses)
    ) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    // Verify the assignment exists
    const assignment = await prisma.teachersAssigned.findUnique({
      where: { id: assignmentId },
    });

    if (!assignment) {
      return NextResponse.json(
        { message: "Assignment not found" },
        { status: 404 }
      );
    }

    // Use a transaction to create responses and suggestion
    const result = await prisma.$transaction(async (tx) => {
      // Create all responses
      const createdResponses = await tx.response.createMany({
        data: responses.map(
          (response: { questionId: string; optionId: string }) => ({
            studentId,
            teacherId,
            questionId: response.questionId,
            optionId: response.optionId,
            assignmentId,
          })
        ),
      });

      // Create suggestion if provided
      let createdSuggestion = null;
      if (suggestion && suggestion.trim()) {
        createdSuggestion = await tx.suggestion.create({
          data: {
            studentId,
            teacherId,
            assignmentId,
            content: suggestion.trim(),
          },
        });
      }

      return { createdResponses, createdSuggestion };
    });

    console.log("Submission successful:", {
      responsesCreated: result.createdResponses.count,
      suggestionCreated: !!result.createdSuggestion,
    });

    return NextResponse.json(
      {
        message: "Assessment submitted successfully",
        responsesCreated: result.createdResponses.count,
        suggestionCreated: !!result.createdSuggestion,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Submit assessment error:", error);
    return NextResponse.json(
      {
        message: "Failed to submit assessment",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
