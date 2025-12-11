import { NextResponse } from "next/server";
import { prisma } from "../../../../../lib/db";
import { auth } from "../../../../../lib/auth";

export async function GET() {
  try {
    const session = await auth();

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Fetch all counts in parallel
    const [
      teachersCount,
      studentsCount,
      coursesCount,
      programsCount,
      responsesCount,
      questionsCount,
      sectionsCount,
      assignmentsCount,
      recentResponsesCount,
      categories,
      completionData,
    ] = await Promise.all([
      // Count unique teachers from TeachersAssigned
      prisma.teachersAssigned
        .findMany({
          distinct: ["teacherId"],
          select: { teacherId: true },
        })
        .then((teachers) => teachers.length),

      // Count students
      prisma.student.count(),

      // Count courses
      prisma.course.count(),

      // Count programs
      prisma.program.count(),

      // Count total responses
      prisma.response.count(),

      // Count questions
      prisma.question.count(),

      // Count sections
      prisma.section.count(),

      // Count assignments (TeachersAssigned)
      prisma.teachersAssigned.count(),

      // Count recent responses (last 30 days)
      prisma.response.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          },
        },
      }),

      // Get categories with question counts
      prisma.category.findMany({
        select: {
          id: true,
          name: true,
          description: true,
          _count: {
            select: {
              Question: true,
            },
          },
        },
        orderBy: {
          name: "asc",
        },
      }),

      // Get assignment response counts for average
      prisma.teachersAssigned.findMany({
        select: {
          _count: {
            select: {
              responses: true,
            },
          },
        },
      }),
    ]);

    // Calculate average responses per assignment
    const averageResponses =
      completionData.length > 0
        ? Math.round(
            completionData.reduce((sum, a) => sum + a._count.responses, 0) /
              completionData.length
          )
        : 0;

    return NextResponse.json(
      {
        teachers: teachersCount,
        students: studentsCount,
        courses: coursesCount,
        programs: programsCount,
        responses: responsesCount,
        questions: questionsCount,
        sections: sectionsCount,
        assignments: assignmentsCount,
        recentResponses: recentResponsesCount,
        averageResponsesPerAssignment: averageResponses,
        categories: categories.map((cat) => ({
          id: cat.id,
          name: cat.name,
          description: cat.description,
          questionCount: cat._count.Question,
        })),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Dashboard stats error:", error);
    return NextResponse.json(
      {
        message: "Failed to fetch dashboard stats",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
