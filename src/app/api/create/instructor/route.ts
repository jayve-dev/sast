import { prisma } from "../../../../../lib/db";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { facultyId, fullName, } = body;
    console.log("DATABASE_URL", process.env.DATABASE_URL);
    const isIdNumberExisting = await prisma.teacher.findUnique({
      where: {
        facultyId: Number(facultyId),
      },
    });

    if (isIdNumberExisting) {
      console.error("This ID number is already in use");
      return NextResponse.json(
        { message: "This ID number is already in use" },
        { status: 500 }
      );
    }

    const newUser = await prisma.teacher.create({
      data: {
        facultyId: Number(facultyId),
        fullName,
      }
    });

    if (!newUser) {
      console.error(
        "There was a problem creating this account. Try again later"
      );
      return NextResponse.json(
        {
          message: "There was a problem creating this account. Try again later",
        },
        { status: 500 }
      );
    }

    return new Response(JSON.stringify(newUser), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error(error);
    return new Response(
      JSON.stringify({ message: "Error creating user", error }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

export async function GET() {
  try {
    const teachers = await prisma.teacher.findMany();
    return NextResponse.json(teachers, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { message: "Failed to fetch the teachers", error },
      { status: 500 }
    );
  }
}
