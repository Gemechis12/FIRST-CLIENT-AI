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

    // Unselect previous niches
    await prisma.niche.updateMany({
      where: { userId: user.id },
      data: { isSelected: false }
    });

    // Create and select new niche
    const newNiche = await prisma.niche.create({
      data: {
        userId: user.id,
        name: data.name,
        whyTheyNeed: data.whyTheyNeed,
        commonProblems: data.commonProblems,
        exampleClients: data.exampleClients,
        opportunity: data.opportunity,
        isSelected: true
      }
    });

    // Update progress
    await prisma.progress.update({
      where: { userId: user.id },
      data: { hasNiche: true }
    });

    return NextResponse.json({ message: "Niche saved", niche: newNiche }, { status: 200 });
  } catch (error) {
    console.error("Save niche error:", error);
    return NextResponse.json({ message: "An error occurred" }, { status: 500 });
  }
}
