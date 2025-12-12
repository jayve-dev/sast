import { NextResponse } from "next/server";
import { prisma } from "../../../../../../lib/db";
import { auth } from "../../../../../../lib/auth";
import bcrypt from "bcryptjs";

export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const params = await context.params;
    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { message: "Student ID is required" },
        { status: 400 }
      );
    }

    const student = await prisma.student.findUnique({
      where: { id },
      include: {
        program: {
          select: {
            id: true,
            name: true,
          },
        },
        User: {
          select: {
            id: true,
            idNumber: true,
            fullName: true,
            role: true,
          },
        },
      },
    });

    if (!student) {
      return NextResponse.json(
        { message: "Student not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(student);
  } catch (error) {
    console.error("Error fetching student:", error);
    return NextResponse.json(
      {
        message: "Failed to fetch student data",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { message: "Student ID is required" },
        { status: 400 }
      );
    }

    const student = await prisma.student.findUnique({
      where: { id },
      include: {
        User: true,
      },
    });

    if (!student) {
      return NextResponse.json(
        { message: "Student not found" },
        { status: 404 }
      );
    }

    if (student.User) {
      await prisma.response.deleteMany({
        where: { studentId: student.User.id },
      });

      await prisma.user.delete({
        where: { id: student.User.id },
      });
    }

    const deletedStudent = await prisma.student.delete({
      where: { id },
    });

    return NextResponse.json(
      {
        message: "Student deleted successfully",
        student: deletedStudent,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Delete student error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Failed to delete student";
    return NextResponse.json({ message: errorMessage }, { status: 500 });
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
    const { idNumber, fullName, programId, password } = body;

    if (!id) {
      return NextResponse.json(
        { message: "Student ID is required" },
        { status: 400 }
      );
    }

    // Check if student exists
    const student = await prisma.student.findUnique({
      where: { id },
      include: {
        User: true,
      },
    });

    if (!student) {
      return NextResponse.json(
        { message: "Student not found" },
        { status: 404 }
      );
    }

    // Check if new ID number is already taken
    if (idNumber && idNumber !== student.idNumber) {
      const existingStudent = await prisma.student.findUnique({
        where: { idNumber: Number(idNumber) },
      });

      if (existingStudent && existingStudent.id !== id) {
        return NextResponse.json(
          { message: "ID number already in use" },
          { status: 400 }
        );
      }
    }

    // Prepare update data for Student
    const studentUpdateData: {
      idNumber?: number;
      fullName?: string;
      programId?: string;
    } = {};

    if (idNumber) studentUpdateData.idNumber = Number(idNumber);
    if (fullName) studentUpdateData.fullName = fullName;
    if (programId) studentUpdateData.programId = programId;

    // Update the student
    const updatedStudent = await prisma.student.update({
      where: { id },
      data: studentUpdateData,
      include: {
        program: true,
      },
    });

    // Update the associated user if exists
    if (student.User) {
      const userUpdateData: {
        idNumber?: number;
        fullName?: string;
        password?: string;
      } = {};

      if (idNumber) userUpdateData.idNumber = Number(idNumber);
      if (fullName) userUpdateData.fullName = fullName;

      // Only hash and update password if provided
      if (password && password.trim()) {
        userUpdateData.password = await bcrypt.hash(password, 10);
      }

      await prisma.user.update({
        where: { id: student.User.id },
        data: userUpdateData,
      });
    }

    return NextResponse.json(
      {
        message: "Student updated successfully",
        student: updatedStudent,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Update student error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Failed to update student";
    return NextResponse.json({ message: errorMessage }, { status: 500 });
  }
}
