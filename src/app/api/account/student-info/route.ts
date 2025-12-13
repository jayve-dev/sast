import { NextResponse } from "next/server";
import { auth } from "../../../../../lib/auth";
import { prisma } from "../../../../../lib/db";

export async function GET() {
  try {
    const session = await auth();

    if (!session || !session.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Get user with student and program data
    const user = await prisma.user.findUnique({
      where: {
        id: session.user.id,
      },
      include: {
        Student: {
          include: {
            program: true, // Include the program relation from Student
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    return NextResponse.json(
      {
        fullName: user.fullName,
        idNumber: user.idNumber,
        role: user.role,
        programName: user.Student?.program?.name || "N/A",
        programId: user.Student?.programId || null,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching student info:", error);
    return NextResponse.json(
      {
        message: "Failed to fetch student information",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
