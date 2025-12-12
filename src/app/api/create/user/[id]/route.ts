import { NextResponse } from "next/server";
import { prisma } from "../../../../../../lib/db";
import { auth } from "../../../../../../lib/auth";
import bcrypt from "bcryptjs";

export async function DELETE(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const params = await context.params;
    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { message: "User ID is required" },
        { status: 400 }
      );
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // Prevent deleting admin accounts
    if (user.role === "ADMIN") {
      return NextResponse.json(
        { message: "Cannot delete admin accounts" },
        { status: 403 }
      );
    }

    // Delete all responses by this user first (foreign key constraint)
    await prisma.response.deleteMany({
      where: { studentId: id },
    });

    // Delete all suggestions by this user
    await prisma.suggestion.deleteMany({
      where: { studentId: id },
    });

    // Delete the user
    await prisma.user.delete({
      where: { id },
    });

    return NextResponse.json(
      { message: "User deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Delete user error:", error);
    return NextResponse.json(
      {
        message: "Failed to delete user",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const params = await context.params;
    const { id } = params;
    const body = await req.json();
    const { idNumber, fullName, password } = body;

    if (!id) {
      return NextResponse.json(
        { message: "User ID is required" },
        { status: 400 }
      );
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // Prevent editing admin accounts
    if (user.role === "ADMIN") {
      return NextResponse.json(
        { message: "Cannot edit admin accounts" },
        { status: 403 }
      );
    }

    // Check if new ID number is already taken
    if (idNumber && idNumber !== user.idNumber) {
      const existingUser = await prisma.user.findUnique({
        where: { idNumber: Number(idNumber) },
      });

      if (existingUser && existingUser.id !== id) {
        return NextResponse.json(
          { message: "ID number already in use" },
          { status: 400 }
        );
      }
    }

    // Prepare update data
    const updateData: {
      idNumber?: number;
      fullName?: string;
      password?: string;
    } = {};

    if (idNumber) updateData.idNumber = Number(idNumber);
    if (fullName) updateData.fullName = fullName;
    if (password && password.trim()) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    // Update the user
    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(
      {
        message: "User updated successfully",
        user: {
          id: updatedUser.id,
          idNumber: updatedUser.idNumber,
          fullName: updatedUser.fullName,
          role: updatedUser.role,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Update user error:", error);
    return NextResponse.json(
      {
        message: "Failed to update user",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
