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
      include: {
        assigns: true,
      },
    });

    console.log("Instructor found:", instructor);

    if (!instructor) {
      return NextResponse.json(
        { message: "Instructor not found" },
        { status: 404 }
      );
    }

    // Get all assignment IDs for this teacher
    const assignmentIds = instructor.assigns.map((assignment) => assignment.id);

    console.log("Assignment IDs to delete:", assignmentIds);

    // Step 1: Delete all responses related to these assignments first
    if (assignmentIds.length > 0) {
      const deletedResponses = await prisma.response.deleteMany({
        where: {
          assignmentId: {
            in: assignmentIds,
          },
        },
      });
      console.log("Deleted responses:", deletedResponses.count);
    }

    // Step 2: Delete all teaching assignments
    const deletedAssignments = await prisma.teachersAssigned.deleteMany({
      where: { teacherId: id },
    });

    console.log("Deleted assignments:", deletedAssignments.count);

    // Step 3: Delete the teacher
    const deletedTeacher = await prisma.teacher.delete({
      where: { id },
    });

    console.log("Deleted teacher:", deletedTeacher);

    return NextResponse.json(
      {
        message: "Instructor deleted successfully",
        instructor: deletedTeacher,
        deletedAssignments: deletedAssignments.count,
        deletedResponses: assignmentIds.length,
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
      include: {
        assigns: true,
      },
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

      // Get all existing assignment IDs for this teacher
      const existingAssignmentIds = instructor.assigns.map((a) => a.id);

      // Delete responses for existing assignments before deleting assignments
      if (existingAssignmentIds.length > 0) {
        await prisma.response.deleteMany({
          where: {
            assignmentId: {
              in: existingAssignmentIds,
            },
          },
        });
        console.log("Deleted responses for existing assignments");
      }

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
