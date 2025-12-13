import { NextResponse } from "next/server";
import { prisma } from "../../../../../lib/db";

export async function GET() {
  try {
    // Get all teachers with their assignments and responses
    const teachers = await prisma.teacher.findMany({
      include: {
        assigns: {
          include: {
            Course: true,
            Program: true,
            Section: true,
            responses: {
              include: {
                Question: {
                  include: {
                    Category: true,
                  },
                },
                Option: true,
                student: {
                  select: {
                    fullName: true,
                    idNumber: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: {
        fullName: "asc",
      },
    });

    // Process data for each teacher
    const teacherSummaries = teachers.map((teacher) => {
      // Get all responses for this teacher
      const allResponses = teacher.assigns.flatMap(
        (assign) => assign.responses
      );

      // Group responses by category
      const categoryAverages: Record<
        string,
        {
          categoryName: string;
          questions: Record<
            string,
            {
              questionText: string;
              totalScore: number;
              count: number;
              average: number;
            }
          >;
          totalScore: number;
          count: number;
          average: number;
        }
      > = {};

      allResponses.forEach((response) => {
        const categoryName = response.Question.Category.name;
        const questionText = response.Question.question;
        const questionId = response.Question.id;
        const score = response.Option?.value || 0;

        // Initialize category if not exists
        if (!categoryAverages[categoryName]) {
          categoryAverages[categoryName] = {
            categoryName,
            questions: {},
            totalScore: 0,
            count: 0,
            average: 0,
          };
        }

        // Initialize question if not exists
        if (!categoryAverages[categoryName].questions[questionId]) {
          categoryAverages[categoryName].questions[questionId] = {
            questionText,
            totalScore: 0,
            count: 0,
            average: 0,
          };
        }

        // Add score to question
        categoryAverages[categoryName].questions[questionId].totalScore +=
          score;
        categoryAverages[categoryName].questions[questionId].count += 1;

        // Add score to category
        categoryAverages[categoryName].totalScore += score;
        categoryAverages[categoryName].count += 1;
      });

      // Calculate averages
      Object.keys(categoryAverages).forEach((categoryName) => {
        const category = categoryAverages[categoryName];
        category.average =
          category.count > 0 ? category.totalScore / category.count : 0;

        Object.keys(category.questions).forEach((questionId) => {
          const question = category.questions[questionId];
          question.average =
            question.count > 0 ? question.totalScore / question.count : 0;
        });
      });

      // Get unique courses taught
      const courses = teacher.assigns.map((assign) => ({
        code: assign.Course.code,
        name: assign.Course.name,
        program: assign.Program.name,
        section: assign.Section.name,
      }));

      // Calculate overall average
      const totalScore = Object.values(categoryAverages).reduce(
        (sum, cat) => sum + cat.totalScore,
        0
      );
      const totalCount = Object.values(categoryAverages).reduce(
        (sum, cat) => sum + cat.count,
        0
      );
      const overallAverage = totalCount > 0 ? totalScore / totalCount : 0;

      return {
        id: teacher.id,
        facultyId: teacher.facultyId,
        fullName: teacher.fullName,
        courses,
        totalResponses: allResponses.length,
        totalStudents: new Set(allResponses.map((r) => r.studentId)).size,
        overallAverage,
        categoryAverages: Object.values(categoryAverages).map((cat) => ({
          categoryName: cat.categoryName,
          average: cat.average,
          questions: Object.values(cat.questions),
        })),
      };
    });

    return NextResponse.json(teacherSummaries, { status: 200 });
  } catch (error) {
    console.error("Error fetching instructor evaluations:", error);
    return NextResponse.json(
      {
        message: "Failed to fetch instructor evaluations",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
