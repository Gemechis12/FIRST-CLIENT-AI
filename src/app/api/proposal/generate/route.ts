import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateProposal } from "@/lib/ai/generateProposal";
import { checkLimit, incrementUsage } from "@/lib/usage";
import { ACTIONS } from "@/lib/plans";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { 
        offers: true 
      }
    });

    if (!user || user.offers.length === 0) {
      return NextResponse.json({ message: "Incomplete profile data" }, { status: 400 });
    }

    const { prospectId, offerId, projectDetails } = await req.json();
    
    if (!prospectId || !offerId) {
      return NextResponse.json({ message: "Prospect ID and Offer ID required" }, { status: 400 });
    }

    const prospect = await prisma.prospect.findUnique({
      where: { id: prospectId, userId: user.id }
    });

    if (!prospect) return NextResponse.json({ message: "Prospect not found" }, { status: 404 });
    
    const offer = user.offers.find(o => o.id === offerId) || user.offers[0];

    const limitCheck = await checkLimit(user.id, ACTIONS.PROPOSAL_GENERATION);
    if (!limitCheck.allowed) {
      return NextResponse.json({ error: "LIMIT_REACHED", message: limitCheck.message, action: limitCheck.action }, { status: 403 });
    }

    const proposal = await generateProposal({
      prospect,
      offer,
      projectDetails
    });
    
    await incrementUsage(user.id, ACTIONS.PROPOSAL_GENERATION);

    return NextResponse.json({ proposal }, { status: 200 });
  } catch (error) {
    console.error("Generate proposal error:", error);
    return NextResponse.json({ message: "An error occurred" }, { status: 500 });
  }
}
