import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateOutreach } from "@/lib/ai/generateOutreach";
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
        offers: { take: 1, orderBy: { updatedAt: 'desc' } }
      }
    });

    if (!user || user.services.length === 0 || user.offers.length === 0) {
      return NextResponse.json({ message: "Incomplete profile data for outreach generation" }, { status: 400 });
    }

    const { prospectId, tone } = await req.json();
    
    if (!prospectId) {
      return NextResponse.json({ message: "Prospect ID required" }, { status: 400 });
    }

    const prospect = await prisma.prospect.findUnique({
      where: { id: prospectId, userId: user.id }
    });

    if (!prospect) {
      return NextResponse.json({ message: "Prospect not found" }, { status: 404 });
    }

    const limitCheck = await checkLimit(user.id, ACTIONS.OUTREACH_GENERATION);
    if (!limitCheck.allowed) {
      return NextResponse.json({ error: "LIMIT_REACHED", message: limitCheck.message, action: limitCheck.action }, { status: 403 });
    }

    const messages = await generateOutreach({
      prospect,
      service: user.services[0].title,
      offer: user.offers[0],
      tone: tone || "Professional"
    });
    
    await incrementUsage(user.id, ACTIONS.OUTREACH_GENERATION);

    return NextResponse.json({ messages }, { status: 200 });
  } catch (error) {
    console.error("Generate outreach error:", error);
    return NextResponse.json({ message: "An error occurred" }, { status: 500 });
  }
}
