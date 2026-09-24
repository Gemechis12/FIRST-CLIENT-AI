import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateServices } from "@/lib/ai/generateServices";
import { checkLimit, incrementUsage } from "@/lib/usage";
import { ACTIONS } from "@/lib/plans";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { onboarding: true }
    });

    if (!user || !user.onboarding) return NextResponse.json({ message: "User or onboarding not found" }, { status: 404 });

    const limitCheck = await checkLimit(user.id, ACTIONS.SERVICE_GENERATION);
    if (!limitCheck.allowed) {
      return NextResponse.json({ error: "LIMIT_REACHED", message: limitCheck.message, action: limitCheck.action }, { status: 403 });
    }

    // Pass the entire onboarding data object so AI gets full context
    const generatedServices = await generateServices(user.onboarding);
    
    await incrementUsage(user.id, ACTIONS.SERVICE_GENERATION);

    return NextResponse.json({ services: generatedServices }, { status: 200 });
  } catch (error) {
    console.error("Generate services error:", error);
    return NextResponse.json({ message: "An error occurred" }, { status: 500 });
  }
}
