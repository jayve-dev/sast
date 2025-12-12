import { prisma } from "../../../../../lib/db";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { idNumber, fullName, password } = body;

    // Validate required fields
    if (!idNumber || !fullName || !password) {
      return NextResponse.json(
        { message: "All fields are required" },
        { status: 400 }
      );
    }

    const idNumberInt = parseInt(idNumber, 10);

    // Check if ID number exists in Student table
    const isIdNumberExisting = await prisma.student.findUnique({
      where: { idNumber: idNumberInt },
    });

    if (!isIdNumberExisting) {
      return NextResponse.json(
        {
          message:
            "This ID number is not found in our records. Please contact the administrator.",
        },
        { status: 404 }
      );
    }

    // Check if full name matches the ID number in Student table
    if (isIdNumberExisting.fullName.toLowerCase() !== fullName.toLowerCase()) {
      return NextResponse.json(
        { message: "The name does not match our records for this ID number." },
        { status: 400 }
      );
    }

    // Check if user account already exists
    const existingUser = await prisma.user.findUnique({
      where: { idNumber: idNumberInt },
    });

    if (existingUser) {
      return NextResponse.json(
        {
          message:
            "An account with this ID number already exists. Please sign in instead.",
        },
        { status: 409 }
      );
    }

    // Hash password and create user
    const hashedPassword = await bcrypt.hash(password, 10);

    const userData = {
      idNumber: idNumberInt,
      fullName: isIdNumberExisting.fullName, // Use the name from Student table to ensure consistency
      password: hashedPassword,
      studentId: isIdNumberExisting.id,
      role: "STUDENT" as const,
    };

    const newUser = await prisma.user.create({ data: userData });

    return NextResponse.json(
      {
        message: "Account created successfully",
        user: {
          id: newUser.id,
          idNumber: newUser.idNumber,
          fullName: newUser.fullName,
          role: newUser.role,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating user:", error);
    return NextResponse.json(
      { message: "An unexpected error occurred. Please try again later." },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        idNumber: true,
        fullName: true,
        role: true,
        createdAt: true,
        Student: {
          select: {
            program: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    return NextResponse.json(users, { status: 200 });
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { message: "Failed to fetch users" },
      { status: 500 }
    );
  }
}
