import { prisma } from "../../../../../lib/db";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { idNumber, fullName, gender, programId } = body;
    console.log("DATABASE_URL", process.env.DATABASE_URL);
    const isIdNumberExisting = await prisma.student.findUnique({
      where: {
        idNumber: Number(idNumber),
      },
    });

    if (isIdNumberExisting) {
      console.error("This ID number is already in use");
      return NextResponse.json(
        { message: "This ID number is already in use" },
        { status: 500 }
      );
    }

    const newUser = await prisma.student.create({
      data: {
        idNumber: Number(idNumber),
        fullName,
        programId,
        gender,
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
    const students = await prisma.student.findMany({
      include: {
        program: true,
      },
    });
    return NextResponse.json(students, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { message: "Failed to fetch the students", error },
      { status: 500 }
    );
  }
}
