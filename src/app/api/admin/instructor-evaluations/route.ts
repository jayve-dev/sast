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

      // Group responses by category (overall)
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

      // Group by Program
      const programAverages: Record<
        string,
        {
          programId: string;
          programName: string;
          totalScore: number;
          count: number;
          average: number;
          responses: number;
        }
      > = {};

      teacher.assigns.forEach((assign) => {
        const programId = assign.Program.id;
        const programName = assign.Program.name;

        if (!programAverages[programId]) {
          programAverages[programId] = {
            programId,
            programName,
            totalScore: 0,
            count: 0,
            average: 0,
            responses: 0,
          };
        }

        assign.responses.forEach((response) => {
          const score = response.Option?.value || 0;
          programAverages[programId].totalScore += score;
          programAverages[programId].count += 1;
          programAverages[programId].responses += 1;
        });

        programAverages[programId].average =
          programAverages[programId].count > 0
            ? programAverages[programId].totalScore /
              programAverages[programId].count
            : 0;
      });

      // Group by Section
      const sectionAverages: Record<
        string,
        {
          sectionId: string;
          sectionName: string;
          programName: string;
          totalScore: number;
          count: number;
          average: number;
          responses: number;
        }
      > = {};

      teacher.assigns.forEach((assign) => {
        const sectionId = assign.Section.id;
        const sectionName = assign.Section.name;
        const programName = assign.Program.name;

        if (!sectionAverages[sectionId]) {
          sectionAverages[sectionId] = {
            sectionId,
            sectionName,
            programName,
            totalScore: 0,
            count: 0,
            average: 0,
            responses: 0,
          };
        }

        assign.responses.forEach((response) => {
          const score = response.Option?.value || 0;
          sectionAverages[sectionId].totalScore += score;
          sectionAverages[sectionId].count += 1;
          sectionAverages[sectionId].responses += 1;
        });

        sectionAverages[sectionId].average =
          sectionAverages[sectionId].count > 0
            ? sectionAverages[sectionId].totalScore /
              sectionAverages[sectionId].count
            : 0;
      });

      // Group by Course (with section details)
      const courseAverages: Record<
        string,
        {
          courseId: string;
          courseCode: string;
          courseName: string;
          programName: string;
          sectionName: string;
          totalScore: number;
          count: number;
          average: number;
          responses: number;
          students: number;
        }
      > = {};

      teacher.assigns.forEach((assign) => {
        const key = `${assign.Course.id}-${assign.Section.id}`;
        const courseId = assign.Course.id;
        const courseCode = assign.Course.code;
        const courseName = assign.Course.name;
        const programName = assign.Program.name;
        const sectionName = assign.Section.name;

        if (!courseAverages[key]) {
          courseAverages[key] = {
            courseId,
            courseCode,
            courseName,
            programName,
            sectionName,
            totalScore: 0,
            count: 0,
            average: 0,
            responses: 0,
            students: 0,
          };
        }

        const uniqueStudents = new Set(
          assign.responses.map((r) => r.studentId)
        );
        courseAverages[key].students = uniqueStudents.size;

        assign.responses.forEach((response) => {
          const score = response.Option?.value || 0;
          courseAverages[key].totalScore += score;
          courseAverages[key].count += 1;
          courseAverages[key].responses += 1;
        });

        courseAverages[key].average =
          courseAverages[key].count > 0
            ? courseAverages[key].totalScore / courseAverages[key].count
            : 0;
      });

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
        totalResponses: allResponses.length,
        totalStudents: new Set(allResponses.map((r) => r.studentId)).size,
        overallAverage,
        categoryAverages: Object.values(categoryAverages).map((cat) => ({
          categoryName: cat.categoryName,
          average: cat.average,
          questions: Object.values(cat.questions),
        })),
        programAverages: Object.values(programAverages),
        sectionAverages: Object.values(sectionAverages),
        courseAverages: Object.values(courseAverages),
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
