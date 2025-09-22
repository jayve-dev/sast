import { prisma } from "../../../../../../lib/db";

export async function POST(req: Request) {
  try {
    const { code, name, programId, sectionId } = await req.json();

    const newCourse = await prisma.course.create({
      data: {
        code,
        name,
        programId,
        sectionId,
      },
    });

    return new Response(JSON.stringify(newCourse), { status: 201 });
  } catch (error) {
    console.error("Error creating course:", error);
    return new Response(
      JSON.stringify({ message: "Internal Server Error" }),
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const courses = await prisma.course.findMany();
    return new Response(JSON.stringify(courses), { status: 200 });
  } catch (error) {
    console.error("Error fetching courses:", error);
    return new Response(
      JSON.stringify({ message: "Internal Server Error" }),
      { status: 500 }
    );
  }
}