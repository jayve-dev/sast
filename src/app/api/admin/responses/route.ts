import { NextResponse } from "next/server";
import { prisma } from "../../../../../lib/db";
import { auth } from "../../../../../lib/auth";

export async function GET(req: Request) {
  try {
    const session = await auth();

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const programId = searchParams.get("programId");
    const sectionId = searchParams.get("sectionId");
    const courseId = searchParams.get("courseId");
    const teacherId = searchParams.get("teacherId");

    // Get all responses with student, teacher, course info
    const responses = await prisma.response.findMany({
      where: {
        ...(teacherId && { teacherId }),
      },
      include: {
        student: true,
        teacher: true,
        assignment: {
          include: {
            Course: true,
            Section: true,
            Program: true,
          },
        },
        Question: {
          include: {
            Category: true,
          },
        },
        Option: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Get all suggestions
    const suggestions = await prisma.suggestion.findMany({
      include: {
        student: true,
        teacher: true,
        assignment: {
          include: {
            Course: true,
            Section: true,
            Program: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Filter by program, section, course if needed
    let filteredResponses = responses;
    if (programId) {
      filteredResponses = filteredResponses.filter(
        (r) => r.assignment.programId === programId
      );
    }
    if (sectionId) {
      filteredResponses = filteredResponses.filter(
        (r) => r.assignment.sectionId === sectionId
      );
    }
    if (courseId) {
      filteredResponses = filteredResponses.filter(
        (r) => r.assignment.courseId === courseId
      );
    }

    // Group responses by student and assignment
    const groupedData = filteredResponses.reduce((acc: any, response) => {
      const key = `${response.studentId}-${response.assignmentId}`;

      if (!acc[key]) {
        // Find matching suggestion for this student-teacher-assignment combo
        const matchingSuggestion = suggestions.find(
          (s) =>
            s.studentId === response.studentId &&
            s.teacherId === response.teacherId &&
            s.assignmentId === response.assignmentId
        );

        acc[key] = {
          studentId: response.studentId,
          studentName: response.student.fullName,
          studentIdNumber: response.student.idNumber,
          teacherId: response.teacherId,
          teacherName: response.teacher.fullName,
          programName: response.assignment.Program.name,
          sectionName: response.assignment.Section.name,
          courseName: response.assignment.Course.name,
          courseCode: response.assignment.Course.code,
          assignmentId: response.assignmentId,
          submittedAt: response.createdAt,
          responseCount: 0,
          hasSuggestion: !!matchingSuggestion,
          suggestionContent: matchingSuggestion?.content,
          suggestionDate: matchingSuggestion?.createdAt,
          responses: [],
        };
      }

      acc[key].responseCount++;
      acc[key].responses.push({
        questionId: response.questionId,
        question: response.Question.question,
        category: response.Question.Category.name,
        answer: response.Option?.text || "N/A",
        value: response.Option?.value || 0,
      });

      return acc;
    }, {});

    const assessments = Object.values(groupedData);

    // Get filter options
    const [programs, sections, courses, teachers] = await Promise.all([
      prisma.program.findMany({
        select: { id: true, name: true },
        orderBy: { name: "asc" },
      }),
      prisma.section.findMany({
        select: { id: true, name: true, programId: true },
        orderBy: { name: "asc" },
      }),
      prisma.course.findMany({
        select: {
          id: true,
          name: true,
          code: true,
          programId: true,
          sectionId: true,
        },
        orderBy: { name: "asc" },
      }),
      prisma.teacher.findMany({
        select: { id: true, fullName: true },
        orderBy: { fullName: "asc" },
      }),
    ]);

    return NextResponse.json(
      {
        assessments,
        filters: {
          programs,
          sections,
          courses,
          teachers,
        },
        total: assessments.length,
        totalSuggestions: assessments.filter((a: any) => a.hasSuggestion).length,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Fetch responses error:", error);
    return NextResponse.json(
      {
        message: "Failed to fetch responses",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}