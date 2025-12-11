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
    });

    if (!program) {
      return NextResponse.json(
        { message: "Program not found" },
        { status: 404 }
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
      { message: "Failed to delete program" },
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
      { message: "Failed to update program" },
      { status: 500 }
    );
  }
}
