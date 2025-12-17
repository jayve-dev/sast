// app/api/account/route.ts
import { NextResponse } from "next/server";
import { prisma } from "../../../../../../lib/db";
import { auth } from "../../../../../../lib/auth";

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        Student: {
          include: {
            program: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      id: user.id,
      idNumber: user.idNumber,
      fullName: user.fullName,
      role: user.role,
      studentId: user.studentId,
      programName: user.Student?.program?.name,
      gender: user.Student?.gender,
      createdAt: user.createdAt,
    });
  } catch (error) {
    console.error("Error fetching account data:", error);
    return NextResponse.json(
      {
        message: "Failed to fetch account data",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { fullName, idNumber } = body;

    if (!fullName || fullName.trim().length === 0) {
      return NextResponse.json(
        { message: "Full name is required" },
        { status: 400 }
      );
    }

    if (!idNumber || typeof idNumber !== "number" || idNumber <= 0) {
      return NextResponse.json(
        { message: "Valid ID number is required" },
        { status: 400 }
      );
    }

    // Check if ID number is already taken by another user
    const existingUser = await prisma.user.findUnique({
      where: { idNumber },
    });

    if (existingUser && existingUser.id !== session.user.id) {
      return NextResponse.json(
        { message: "This ID number is already in use" },
        { status: 400 }
      );
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        fullName: fullName.trim(),
        idNumber,
      },
      include: {
        Student: {
          include: {
            program: true,
          },
        },
      },
    });

    // If user has a student record, update it too
    if (updatedUser.studentId) {
      await prisma.student.update({
        where: { id: updatedUser.studentId },
        data: {
          fullName: fullName.trim(),
          idNumber,
        },
      });
    }

    return NextResponse.json({
      id: updatedUser.id,
      idNumber: updatedUser.idNumber,
      fullName: updatedUser.fullName,
      role: updatedUser.role,
      studentId: updatedUser.studentId,
      programName: updatedUser.Student?.program?.name,
      gender: updatedUser.Student?.gender,
      createdAt: updatedUser.createdAt,
    });
  } catch (error) {
    console.error("Error updating account:", error);
    return NextResponse.json(
      {
        message: "Failed to update account",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}