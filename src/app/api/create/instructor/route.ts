import { prisma } from "../../../../../lib/db";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { facultyId, fullName } = body;

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
        { status: 400 }
      );
    }

    const newUser = await prisma.teacher.create({
      data: {
        facultyId: Number(facultyId),
        fullName,
      },
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

    return NextResponse.json(newUser, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Error creating user", error },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const teachers = await prisma.teacher.findMany({
      include: {
        assigns: {
          include: {
            Course: true,
            Section: true,
            Program: true,
          },
          orderBy: {
            createdAt: "desc",
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(teachers, { status: 200 });
  } catch (error) {
    console.error("Failed to fetch teachers:", error);
    return NextResponse.json(
      { message: "Failed to fetch the teachers", error },
      { status: 500 }
    );
  }
}
