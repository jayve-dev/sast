import { NextResponse } from "next/server";
import { prisma } from "../../../../../../lib/db";
import { auth } from "../../../../../../lib/auth";

export async function POST(req: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { assignmentId, teacherId, responses } = body;

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

    // Create all responses in a transaction
    const createdResponses = await prisma.$transaction(
      responses.map((response: { questionId: string; optionId: string }) =>
        prisma.response.create({
          data: {
            studentId: session.user.id,
            teacherId,
            questionId: response.questionId,
            optionId: response.optionId,
            assignmentId,
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
    return NextResponse.json(
      { message: "Failed to submit assessment" },
      { status: 500 }
    );
  }
}
