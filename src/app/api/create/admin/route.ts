import { prisma } from "../../../../../lib/db";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { Role } from "@/generated/prisma/enums";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { idNumber, fullName, password, role } = body;
    console.log("DATABASE_URL", process.env.DATABASE_URL);
    const isIdNumberExisting = await prisma.user.findUnique({
      where: {
        idNumber: idNumber as number,
      },
    });

    if (isIdNumberExisting) {
      console.error("This ID number is already in use");
      return NextResponse.json(
        { message: "This ID number is already in use" },
        { status: 500 }
      );
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const idNumberInt = parseInt(idNumber, 10);

    interface UserData {
      idNumber: number;
      fullName: string;
      password: string;
      role: Role;
    }

    const userData: UserData = {
      idNumber: idNumberInt,
      fullName,
      password: hashedPassword,
      role: role as Role,
    };

    const newUser = await prisma.user.create({ data: userData });

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
      JSON.stringify({ message: "Error creating Admin", error }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

export async function GET() {
  try {
    const users = await prisma.user.findMany();
    return NextResponse.json(users, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { message: "Failed to fetch the admins", error },
      { status: 500 }
    );
  }
}
