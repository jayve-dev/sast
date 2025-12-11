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
      responses,
      studentId, // Add this if you're passing it from the form
    } = body;

    console.log("Received submission:", body); // Debug log

    // Validate required fields
    if (
      !assignmentId ||
      !teacherId ||
      !responses ||
      !Array.isArray(responses)
    ) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    if (responses.length === 0) {
      return NextResponse.json(
        { message: "No responses provided" },
        { status: 400 }
      );
    }

    // Check if student already submitted for this assignment and teacher
    const existingResponse = await prisma.response.findFirst({
      where: {
        assignmentId,
        teacherId,
        // If you have studentId, add it here
        // studentId: studentId,
      },
    });

    if (existingResponse) {
      return NextResponse.json(
        {
          message:
            "You have already submitted an assessment for this instructor",
        },
        { status: 400 }
      );
    }

    // Validate all questions and options exist
    for (const response of responses) {
      const question = await prisma.question.findUnique({
        where: { id: response.questionId },
        include: { Option: true },
      });

      if (!question) {
        return NextResponse.json(
          { message: `Question ${response.questionId} not found` },
          { status: 400 }
        );
      }

      const optionExists = question.Option.some(
        (opt) => opt.id === response.optionId
      );
      if (!optionExists) {
        return NextResponse.json(
          { message: `Invalid option for question ${response.questionId}` },
          { status: 400 }
        );
      }
    }

    // Create all responses in a transaction
    const createdResponses = await prisma.$transaction(
      responses.map((response: { questionId: string; optionId: string }) =>
        prisma.response.create({
          data: {
            teacherId,
            questionId: response.questionId,
            optionId: response.optionId,
            assignmentId,
            studentId,
            // Add studentId if you're tracking it
            // studentId: studentId,
          },
        })
      )
    );

    return NextResponse.json(
      {
        message: "Assessment submitted successfully",
        count: createdResponses.length,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Submit assessment error:", error);

    // Return proper JSON error response
    return NextResponse.json(
      {
        message: "Failed to submit assessment",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
