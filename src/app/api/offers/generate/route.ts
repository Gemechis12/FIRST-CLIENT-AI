import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateOffer } from "@/lib/ai/generateOffer";
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
        niches: { where: { isSelected: true } }
      }
    });

    if (!user || !user.onboarding || user.services.length === 0 || user.niches.length === 0) {
      return NextResponse.json({ message: "Incomplete profile data" }, { status: 400 });
    }

    const limitCheck = await checkLimit(user.id, ACTIONS.OFFER_GENERATION);
    if (!limitCheck.allowed) {
      return NextResponse.json({ error: "LIMIT_REACHED", message: limitCheck.message, action: limitCheck.action }, { status: 403 });
    }

    const offerData = await generateOffer(
      user.services[0],
      user.niches[0],
      user.onboarding
    );
    
    await incrementUsage(user.id, ACTIONS.OFFER_GENERATION);

    return NextResponse.json({ offer: offerData }, { status: 200 });
  } catch (error) {
    console.error("Generate offer error:", error);
    return NextResponse.json({ message: "An error occurred" }, { status: 500 });
  }
}
