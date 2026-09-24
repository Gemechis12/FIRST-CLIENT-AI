import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateNiches } from "@/lib/ai/generateNiches";
import { checkLimit, incrementUsage } from "@/lib/usage";
import { ACTIONS } from "@/lib/plans";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { 
        services: { where: { isSelected: true } },
        onboarding: true
      }
    });

    if (!user || user.services.length === 0 || !user.onboarding) return NextResponse.json({ message: "User or service not found" }, { status: 404 });

    const limitCheck = await checkLimit(user.id, ACTIONS.NICHE_GENERATION);
    if (!limitCheck.allowed) {
      return NextResponse.json({ error: "LIMIT_REACHED", message: limitCheck.message, action: limitCheck.action }, { status: 403 });
    }

    const service = user.services[0];
    const generatedNiches = await generateNiches(service, user.onboarding);
    
    await incrementUsage(user.id, ACTIONS.NICHE_GENERATION);

    return NextResponse.json({ niches: generatedNiches }, { status: 200 });
  } catch (error) {
    console.error("Generate niches error:", error);
    return NextResponse.json({ message: "An error occurred" }, { status: 500 });
  }
}
