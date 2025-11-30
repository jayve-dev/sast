import { prisma } from "../../../../../../lib/db";

export async function POST(req: Request) {
  try {
    const { name } = await req.json();

    const newProgram = await prisma.program.create({
      data: {
        name,
      },
    });

    return new Response(JSON.stringify(newProgram), { status: 201 });
  } catch (error) {
    console.error("Error creating program:", error);
    return new Response(
      JSON.stringify({ message: "Internal Server Error" }),
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const programs = await prisma.program.findMany();
    return new Response(JSON.stringify(programs), { status: 200 });
  } catch (error) {
    console.error("Error fetching programs:", error);
    return new Response(
      JSON.stringify({ message: "Internal Server Error" }),
      { status: 500 }
    );
  }
}