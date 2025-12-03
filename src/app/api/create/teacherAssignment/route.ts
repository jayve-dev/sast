import { NextResponse } from "next/server";
import { prisma } from "../../../../../lib/db";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { teacherId, programId, courseId, sectionId } = body;

    if (!teacherId || !programId || !courseId || !sectionId ) {
      return NextResponse.json(
        { message: "All fields are required" },
        { status: 400 }
      );
    }

    const assignment = await prisma.teachersAssigned.create({
      data: {
        teacherId,
        programId,
        courseId,
        sectionId,
      },
      include: {
        Teacher: true,
        Program: true,
        Course: true,
        Section: true,
      },
    });

    return NextResponse.json(assignment, { status: 201 });
  } catch (error) {
    console.error("Create assignment error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Failed to create assignment";
    return NextResponse.json({ message: errorMessage }, { status: 500 });
  }
}