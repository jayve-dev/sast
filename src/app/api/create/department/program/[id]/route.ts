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
        { message: "Program ID is required" },
        { status: 400 }
      );
    }

    const program = await prisma.program.findUnique({
      where: { id },
      include: {
        students: true,
        sections: true,
        courses: true,
        assign: true,
      },
    });

    if (!program) {
      return NextResponse.json(
        { message: "Program not found" },
        { status: 404 }
      );
    }

    // Check for dependencies
    if (program.students.length > 0) {
      return NextResponse.json(
        {
          message: `Cannot delete program. It has ${program.students.length} student(s) enrolled.`,
        },
        { status: 400 }
      );
    }

    if (program.sections.length > 0) {
      return NextResponse.json(
        {
          message: `Cannot delete program. It has ${program.sections.length} section(s) assigned.`,
        },
        { status: 400 }
      );
    }

    if (program.courses.length > 0) {
      return NextResponse.json(
        {
          message: `Cannot delete program. It has ${program.courses.length} course(s) assigned.`,
        },
        { status: 400 }
      );
    }

    if (program.assign.length > 0) {
      return NextResponse.json(
        {
          message: `Cannot delete program. It has ${program.assign.length} teacher assignment(s).`,
        },
        { status: 400 }
      );
    }

    await prisma.program.delete({
      where: { id },
    });

    return NextResponse.json(
      { message: "Program deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Delete program error:", error);
    return NextResponse.json(
      {
        message: "Failed to delete program",
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
    const { name } = body;

    if (!id) {
      return NextResponse.json(
        { message: "Program ID is required" },
        { status: 400 }
      );
    }

    if (!name) {
      return NextResponse.json(
        { message: "Program name is required" },
        { status: 400 }
      );
    }

    const program = await prisma.program.findUnique({
      where: { id },
    });

    if (!program) {
      return NextResponse.json(
        { message: "Program not found" },
        { status: 404 }
      );
    }

    const updatedProgram = await prisma.program.update({
      where: { id },
      data: { name },
    });

    return NextResponse.json(
      {
        message: "Program updated successfully",
        program: updatedProgram,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Update program error:", error);
    return NextResponse.json(
      {
        message: "Failed to update program",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
