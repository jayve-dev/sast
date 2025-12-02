import { NextResponse } from "next/server";
import { prisma } from "../../../../../../lib/db";

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { message: "Instructor ID is required" },
        { status: 400 }
      );
    }

    // Delete all teaching assignments first (due to foreign key constraint)
    await prisma.teachersAssigned.deleteMany({
      where: { teacherId: id },
    });

    // Delete all responses from this teacher
    await prisma.response.deleteMany({
      where: { teacherId: id },
    });

    // Then delete the teacher
    const deletedTeacher = await prisma.teacher.delete({
      where: { id },
    });

    return NextResponse.json(
      {
        message: "Instructor deleted successfully",
        instructor: deletedTeacher,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Delete instructor error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Failed to delete instructor";
    return NextResponse.json({ message: errorMessage }, { status: 500 });
  }
}
