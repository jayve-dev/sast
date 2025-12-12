import { NextResponse } from "next/server";
import { prisma } from "../../../../../../lib/db";
import bcrypt from "bcryptjs";

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { message: "Admin ID is required" },
        { status: 400 }
      );
    }

    // Check if user exists and is an admin
    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      return NextResponse.json({ message: "Admin not found" }, { status: 404 });
    }

    if (user.role !== "ADMIN") {
      return NextResponse.json(
        { message: "User is not an admin" },
        { status: 400 }
      );
    }

    // Delete the admin user
    const deletedUser = await prisma.user.delete({
      where: { id },
    });

    return NextResponse.json(
      {
        message: "Admin deleted successfully",
        user: deletedUser,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Delete admin error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Failed to delete admin";
    return NextResponse.json({ message: errorMessage }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { idNumber, fullName, password } = body;

    if (!id) {
      return NextResponse.json(
        { message: "Admin ID is required" },
        { status: 400 }
      );
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      return NextResponse.json({ message: "Admin not found" }, { status: 404 });
    }

    if (user.role !== "ADMIN") {
      return NextResponse.json(
        { message: "User is not an admin" },
        { status: 400 }
      );
    }

    // Check if new ID number is already taken by another user
    if (idNumber && idNumber !== user.idNumber) {
      const existingUser = await prisma.user.findUnique({
        where: { idNumber },
      });

      if (existingUser && existingUser.id !== id) {
        return NextResponse.json(
          { message: "ID number already in use" },
          { status: 400 }
        );
      }
    }

    // Prepare update data with proper typing
    const updateData: {
      idNumber?: number;
      fullName?: string;
      password?: string;
    } = {};

    if (idNumber) updateData.idNumber = idNumber;
    if (fullName) updateData.fullName = fullName;

    // Only hash and update password if provided
    if (password && password.trim()) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    // Update the admin
    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(
      {
        message: "Admin updated successfully",
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
    console.error("Update admin error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Failed to update admin";
    return NextResponse.json({ message: errorMessage }, { status: 500 });
  }
}
