import { prisma } from "../../../../../../lib/db";

export async function POST(req: Request) {
  try {
    const { name, programId } = await req.json();

    const newSection = await prisma.section.create({
      data: {
        name,
        programId
      },
    });

    return new Response(JSON.stringify(newSection), { status: 201 });
  } catch (error) {
    console.error("Error creating section:", error);
    return new Response(
      JSON.stringify({ message: "Internal Server Error" }),
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const sections = await prisma.section.findMany();
    return new Response(JSON.stringify(sections), { status: 200 });
  } catch (error) {
    console.error("Error fetching sections:", error);
    return new Response(
      JSON.stringify({ message: "Internal Server Error" }),
      { status: 500 }
    );
  }
}