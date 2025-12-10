import { NextResponse } from "next/server";
import { prisma } from "../../../../../../lib/db";

export async function DELETE(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const { id } = params;

    console.log("DELETE request received for instructor ID:", id);

    if (!id) {
      console.error("No ID provided");
      return NextResponse.json(
        { message: "Instructor ID is required" },
        { status: 400 }
      );
    }

    // Check if instructor exists
    const instructor = await prisma.teacher.findUnique({
      where: { id },
    });

    console.log("Instructor found:", instructor);

    if (!instructor) {
      return NextResponse.json(
        { message: "Instructor not found" },
        { status: 404 }
      );
    }

    // Delete all teaching assignments first
    const deletedAssignments = await prisma.teachersAssigned.deleteMany({
      where: { teacherId: id },
    });

    console.log("Deleted assignments:", deletedAssignments.count);

    // Delete the teacher
    const deletedTeacher = await prisma.teacher.delete({
      where: { id },
    });

    console.log("Deleted teacher:", deletedTeacher);

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
    return NextResponse.json(
      { message: errorMessage, error: String(error) },
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
    const { facultyId, fullName, assignments } = body;

    console.log("PATCH request received for instructor ID:", id);
    console.log("Update data:", { facultyId, fullName, assignments });

    if (!id) {
      return NextResponse.json(
        { message: "Instructor ID is required" },
        { status: 400 }
      );
    }

    // Check if instructor exists
    const instructor = await prisma.teacher.findUnique({
      where: { id },
    });

    if (!instructor) {
      return NextResponse.json(
        { message: "Instructor not found" },
        { status: 404 }
      );
    }

    // Check if new faculty ID is already taken
    if (facultyId && facultyId !== instructor.facultyId.toString()) {
      const existingInstructor = await prisma.teacher.findUnique({
        where: { facultyId: Number(facultyId) },
      });

      if (existingInstructor && existingInstructor.id !== id) {
        return NextResponse.json(
          { message: "Faculty ID already in use" },
          { status: 400 }
        );
      }
    }

    // Update the instructor basic info
    const updateData: {
      facultyId?: number;
      fullName?: string;
    } = {};

    if (facultyId) updateData.facultyId = Number(facultyId);
    if (fullName) updateData.fullName = fullName;

    await prisma.teacher.update({
      where: { id },
      data: updateData,
    });

    // Update assignments if provided
    if (assignments && Array.isArray(assignments) && assignments.length > 0) {
      console.log("Updating assignments:", assignments);

      // Delete all existing assignments for this teacher
      await prisma.teachersAssigned.deleteMany({
        where: { teacherId: id },
      });

      // Create new assignments
      const createData = assignments.map(
        (assignment: {
          programId: string;
          courseId: string;
          sectionId: string;
        }) => ({
          teacherId: id,
          programId: assignment.programId,
          courseId: assignment.courseId,
          sectionId: assignment.sectionId,
        })
      );

      console.log("Creating assignments:", createData);

      await prisma.teachersAssigned.createMany({
        data: createData,
      });
    }

    // Fetch updated instructor with all related data
    const updatedInstructor = await prisma.teacher.findUnique({
      where: { id },
      include: {
        assigns: {
          include: {
            Course: true,
            Section: true,
            Program: true,
          },
        },
      },
    });

    console.log("Updated instructor:", updatedInstructor);

    return NextResponse.json(
      {
        message: "Instructor updated successfully",
        instructor: updatedInstructor,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Update instructor error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Failed to update instructor";
    return NextResponse.json(
      { message: errorMessage, error: String(error) },
      { status: 500 }
    );
  }
}
