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
        { message: "Section ID is required" },
        { status: 400 }
      );
    }

    const section = await prisma.section.findUnique({
      where: { id },
    });

    if (!section) {
      return NextResponse.json(
        { message: "Section not found" },
        { status: 404 }
      );
    }

    await prisma.section.delete({
      where: { id },
    });

    return NextResponse.json(
      { message: "Section deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Delete section error:", error);
    return NextResponse.json(
      { message: "Failed to delete section" },
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
        { message: "Section ID is required" },
        { status: 400 }
      );
    }

    if (!name) {
      return NextResponse.json(
        { message: "Section name is required" },
        { status: 400 }
      );
    }

    const section = await prisma.section.findUnique({
      where: { id },
    });

    if (!section) {
      return NextResponse.json(
        { message: "Section not found" },
        { status: 404 }
      );
    }

    const updatedSection = await prisma.section.update({
      where: { id },
      data: { name },
    });

    return NextResponse.json(
      {
        message: "Section updated successfully",
        section: updatedSection,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Update section error:", error);
    return NextResponse.json(
      { message: "Failed to update section" },
      { status: 500 }
    );
  }
}
