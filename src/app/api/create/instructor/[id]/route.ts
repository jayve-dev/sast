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
      return NextResponse.json(
        { message: "Instructor ID is required" },
        { status: 400 }
      );
    }

    // First, get the instructor with all related data
    const instructor = await prisma.teacher.findUnique({
      where: { id },
      include: {
        assigns: true,
        responses: true,
        suggestions: true,
      },
    });

    if (!instructor) {
      return NextResponse.json(
        { message: "Instructor not found" },
        { status: 404 }
      );
    }

    console.log("Instructor found:", instructor);

    // Check if instructor can be deleted
    if (instructor.responses.length > 0) {
      return NextResponse.json(
        {
          message: `Cannot delete instructor. They have response(s) in the system.`,
        },
        { status: 400 }
      );
    }

    // Delete related records in the correct order
    const assignmentIds = instructor.assigns.map((a) => a.id);

    if (assignmentIds.length > 0) {
      console.log("Assignment IDs to delete:", assignmentIds);

      // Step 1: Delete suggestions related to these assignments
      const deletedSuggestions = await prisma.suggestion.deleteMany({
        where: {
          OR: [
            { teacherId: id }, // Suggestions made by this teacher
            { assignmentId: { in: assignmentIds } }, // Suggestions for this teacher's assignments
          ],
        },
      });
      console.log("Deleted suggestions:", deletedSuggestions.count);

      // Step 2: Delete responses related to these assignments
      const deletedResponses = await prisma.response.deleteMany({
        where: {
          OR: [
            { teacherId: id }, // Responses for this teacher
            { assignmentId: { in: assignmentIds } }, // Responses for this teacher's assignments
          ],
        },
      });
      console.log("Deleted responses:", deletedResponses.count);

      // Step 3: Delete teacher assignments
      const deletedAssignments = await prisma.teachersAssigned.deleteMany({
        where: { id: { in: assignmentIds } },
      });
      console.log("Deleted assignments:", deletedAssignments.count);
    }

    // Step 4: Finally, delete the instructor
    await prisma.teacher.delete({
      where: { id },
    });

    console.log("Instructor deleted successfully");

    return NextResponse.json(
      { message: "Instructor deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Delete instructor error:", error);
    return NextResponse.json(
      {
        message: "Failed to delete instructor",
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
    const { facultyId, fullName, assignments } = body;

    if (!id) {
      return NextResponse.json(
        { message: "Instructor ID is required" },
        { status: 400 }
      );
    }

    if (!fullName || !facultyId) {
      return NextResponse.json(
        { message: "Full name and faculty ID are required" },
        { status: 400 }
      );
    }

    const instructor = await prisma.teacher.findUnique({
      where: { id },
      include: { assigns: true },
    });

    if (!instructor) {
      return NextResponse.json(
        { message: "Instructor not found" },
        { status: 404 }
      );
    }

    // Check if facultyId is being changed and if new facultyId already exists
    if (String(facultyId) !== String(instructor.facultyId)) {
      const existingInstructor = await prisma.teacher.findUnique({
        where: { facultyId: Number(facultyId) },
      });

      if (existingInstructor) {
        return NextResponse.json(
          { message: "Faculty ID already exists" },
          { status: 409 }
        );
      }
    }

    // Update teacher basic info
    const updatedInstructor = await prisma.teacher.update({
      where: { id },
      data: {
        fullName,
        facultyId: Number(facultyId),
      },
    });

    // If assignments provided, reconcile them
    if (Array.isArray(assignments)) {
      // Normalize incoming assignments to string keys for comparison
      const incomingKeys = assignments.map(
        (a: any) =>
          `${String(a.programId)}::${String(a.courseId)}::${String(
            a.sectionId
          )}`
      );

      // Build map of existing assigns with key => id
      const existingAssigns = instructor.assigns || [];
      const existingMap = new Map<string, string>();
      existingAssigns.forEach((ea: any) => {
        const key = `${String(ea.programId)}::${String(ea.courseId)}::${String(
          ea.sectionId
        )}`;
        existingMap.set(key, ea.id);
      });

      // Determine creates and deletes
      const toCreate = assignments.filter(
        (a: any) =>
          !existingMap.has(
            `${String(a.programId)}::${String(a.courseId)}::${String(
              a.sectionId
            )}`
          )
      );

      const toKeepKeys = new Set(incomingKeys);
      const toDelete = existingAssigns.filter(
        (ea: any) =>
          !toKeepKeys.has(
            `${String(ea.programId)}::${String(ea.courseId)}::${String(
              ea.sectionId
            )}`
          )
      );

      // Before deleting assignments, ensure none have responses
      const deletableIds: string[] = [];
      for (const ea of toDelete) {
        const respCount = await prisma.response.count({
          where: { assignmentId: ea.id },
        });
        if (respCount > 0) {
          return NextResponse.json(
            {
              message: `Cannot remove assignment it has response(s).`,
            },
            { status: 400 }
          );
        }
        deletableIds.push(ea.id);
      }

      // Perform deletions
      if (deletableIds.length > 0) {
        await prisma.teachersAssigned.deleteMany({
          where: { id: { in: deletableIds } },
        });
      }

      // Perform creations
      if (toCreate.length > 0) {
        // prepare create data
        const createData = toCreate.map((a: any) => ({
          teacherId: id,
          programId: a.programId,
          courseId: a.courseId,
          sectionId: a.sectionId,
        }));

        // createMany (skips duplicates at DB level if constraint exists)
        await prisma.teachersAssigned.createMany({
          data: createData,
        });
      }
    }

    // Return updated instructor with assignments included
    const result = await prisma.teacher.findUnique({
      where: { id },
      include: {
        assigns: {
          include: {
            Course: true,
            Program: true,
            Section: true,
          },
        },
      },
    });

    return NextResponse.json(
      {
        message: "Instructor updated successfully",
        instructor: result,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Update instructor error:", error);
    return NextResponse.json(
      {
        message: "Failed to update instructor",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
