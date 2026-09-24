import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) return NextResponse.json({ message: "User not found" }, { status: 404 });

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) return NextResponse.json({ message: "Missing project ID" }, { status: 400 });

    await prisma.portfolioProject.delete({
      where: { id, userId: user.id } // Ensures the user owns it before deleting
    });

    // Check if they have any remaining projects. If not, update progress to false.
    const remainingProjects = await prisma.portfolioProject.count({
      where: { userId: user.id }
    });

    if (remainingProjects === 0) {
      await prisma.progress.update({
        where: { userId: user.id },
        data: { hasPortfolio: false }
      });
    }

    return NextResponse.json({ message: "Project deleted" }, { status: 200 });
  } catch (error) {
    console.error("Delete portfolio project error:", error);
    return NextResponse.json({ message: "An error occurred" }, { status: 500 });
  }
}
