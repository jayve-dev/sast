import { NextResponse } from "next/server";
import { prisma } from "../../../../../lib/db";

export async function GET() {
  try {
    // Get or create survey status
    let status = await prisma.surveyStatus.findFirst();

    if (!status) {
      // Create default status if none exists
      status = await prisma.surveyStatus.create({
        data: {
          isActive: true,
        },
      });
    }

    return NextResponse.json(status);
  } catch (error) {
    console.error("Error fetching survey status:", error);
    return NextResponse.json(
      { error: "Failed to fetch survey status" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { isActive, updatedBy } = await request.json();

    // Get existing status or create new one
    let status = await prisma.surveyStatus.findFirst();

    if (status) {
      // Update existing status
      status = await prisma.surveyStatus.update({
        where: { id: status.id },
        data: {
          isActive,
          updatedBy,
          updatedAt: new Date(),
        },
      });
    } else {
      // Create new status
      status = await prisma.surveyStatus.create({
        data: {
          isActive,
          updatedBy,
        },
      });
    }

    return NextResponse.json(status);
  } catch (error) {
    console.error("Error updating survey status:", error);
    return NextResponse.json(
      { error: "Failed to update survey status" },
      { status: 500 }
    );
  }
}
