import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const data = await req.json();
    
    // Save Onboarding
    await prisma.onboarding.upsert({
      where: { userId: user.id },
      update: {
        skill: data.skill,
        experienceLevel: data.experienceLevel,
        hasClientsBefore: data.hasClientsBefore,
        targetClients: data.targetClients.join(", "),
        mainGoal: data.mainGoal,
        currency: data.currency,
        isCompleted: true
      },
      create: {
        userId: user.id,
        skill: data.skill,
        experienceLevel: data.experienceLevel,
        hasClientsBefore: data.hasClientsBefore,
        targetClients: data.targetClients.join(", "),
        mainGoal: data.mainGoal,
        currency: data.currency,
        isCompleted: true
      }
    });

    // Also set initial Progress (hasSkill = true because they entered a skill)
    await prisma.progress.upsert({
      where: { userId: user.id },
      update: { hasSkill: true, percentage: 12 }, // 1/8 = 12.5% -> round to 12%
      create: {
        userId: user.id,
        hasSkill: true,
        percentage: 12
      }
    });

    return NextResponse.json({ message: "Onboarding saved successfully" }, { status: 200 });
  } catch (error) {
    console.error("Onboarding error:", error);
    return NextResponse.json(
      { message: "An error occurred while saving onboarding" },
      { status: 500 }
    );
  }
}
