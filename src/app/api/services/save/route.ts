import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) return NextResponse.json({ message: "User not found" }, { status: 404 });

    const data = await req.json();

    // First, unselect any previously selected services
    await prisma.service.updateMany({
      where: { userId: user.id },
      data: { isSelected: false }
    });

    // Create and select the new service
    const newService = await prisma.service.create({
      data: {
        userId: user.id,
        title: data.title,
        description: data.description,
        targetClients: data.targetClients,
        problemsSolved: data.problemsSolved,
        deliverables: data.deliverables,
        isBeginnerFriendly: data.isBeginnerFriendly,
        isSelected: true
      }
    });

    // Update progress
    await prisma.progress.update({
      where: { userId: user.id },
      data: { hasService: true }
    });

    return NextResponse.json({ message: "Service saved", service: newService }, { status: 200 });
  } catch (error) {
    console.error("Save service error:", error);
    return NextResponse.json({ message: "An error occurred" }, { status: 500 });
  }
}
