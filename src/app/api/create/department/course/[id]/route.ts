import { NextResponse } from "next/server";
import { prisma } from "../../../../../../../lib/db";

export async function DELETE(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { message: "Course ID is required" },
        { status: 400 }
      );
    }

    const course = await prisma.course.findUnique({
      where: { id },
      include: {
        assigned: true,
      },
    });

    if (!course) {
      return NextResponse.json(
        { message: "Course not found" },
        { status: 404 }
      );
    }

    // Check for dependencies
    if (course.assigned.length > 0) {
      return NextResponse.json(
        {
          message: `Cannot delete course. It has ${course.assigned.length} teacher assignment(s).`,
        },
        { status: 400 }
      );
    }

    await prisma.course.delete({
      where: { id },
    });

    return NextResponse.json(
      { message: "Course deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Delete course error:", error);
    return NextResponse.json(
      {
        message: "Failed to delete course",
        error: error instanceof Error ? error.message : "Unknown error",
      },
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
    const { name, code } = body;

    if (!id) {
      return NextResponse.json(
        { message: "Course ID is required" },
        { status: 400 }
      );
    }

    if (!name || !code) {
      return NextResponse.json(
        { message: "Course name and code are required" },
        { status: 400 }
      );
    }

    const course = await prisma.course.findUnique({
      where: { id },
    });

    if (!course) {
      return NextResponse.json(
        { message: "Course not found" },
        { status: 404 }
      );
    }

    const updatedCourse = await prisma.course.update({
      where: { id },
      data: { name, code },
    });

    return NextResponse.json(
      {
        message: "Course updated successfully",
        course: updatedCourse,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Update course error:", error);
    return NextResponse.json(
      {
        message: "Failed to update course",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
