import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generatePortfolioBrief } from "@/lib/ai/generatePortfolioBrief";
import { checkLimit, incrementUsage } from "@/lib/usage";
import { ACTIONS } from "@/lib/plans";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { 
        onboarding: true,
        services: { where: { isSelected: true } },
        niches: { where: { isSelected: true } },
        offers: { take: 1, orderBy: { updatedAt: 'desc' } }
      }
    });

    if (!user || !user.onboarding || user.services.length === 0 || user.niches.length === 0 || user.offers.length === 0) {
      return NextResponse.json({ message: "Incomplete profile data for portfolio generation" }, { status: 400 });
    }

    const limitCheck = await checkLimit(user.id, ACTIONS.PORTFOLIO_GENERATION);
    if (!limitCheck.allowed) {
      return NextResponse.json({ error: "LIMIT_REACHED", message: limitCheck.message, action: limitCheck.action }, { status: 403 });
    }

    const projectData = await generatePortfolioBrief({
      service: user.services[0].title,
      niche: user.niches[0].name,
      offer: user.offers[0]
    });
    
    await incrementUsage(user.id, ACTIONS.PORTFOLIO_GENERATION);

    return NextResponse.json({ project: projectData }, { status: 200 });
  } catch (error) {
    console.error("Generate portfolio error:", error);
    return NextResponse.json({ message: "An error occurred" }, { status: 500 });
  }
}
