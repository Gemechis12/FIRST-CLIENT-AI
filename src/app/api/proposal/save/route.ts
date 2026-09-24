import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { checkModelLimit } from "@/lib/usage";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) return NextResponse.json({ message: "User not found" }, { status: 404 });

    const data = await req.json();

    let savedProposal;
    
    if (data.id) {
      // Update existing
      savedProposal = await prisma.proposal.update({
        where: { id: data.id, userId: user.id },
        data: {
          title: data.title,
          content: data.content,
          price: data.price,
          paymentTerms: data.paymentTerms,
          status: data.status || "Ready"
        }
      });
    } else {
      // Create new
      const limitCheck = await checkModelLimit(user.id, "proposals");
      if (!limitCheck.allowed) {
        return NextResponse.json({ error: "LIMIT_REACHED", message: limitCheck.message, action: limitCheck.action }, { status: 403 });
      }

      savedProposal = await prisma.proposal.create({
        data: {
          userId: user.id,
          prospectId: data.prospectId,
          offerId: data.offerId,
          title: data.title,
          content: data.content,
          price: data.price,
          paymentTerms: data.paymentTerms,
          status: data.status || "Ready"
        }
      });
    }

    // Update prospect status if marked as sent
    if (data.status === "Sent" && data.prospectId) {
      await prisma.prospect.update({
        where: { id: data.prospectId },
        data: { status: "Proposal Sent" }
      });
    } else if (data.status === "Accepted" && data.prospectId) {
      await prisma.prospect.update({
        where: { id: data.prospectId },
        data: { status: "Won" }
      });
    } else if (data.status === "Declined" && data.prospectId) {
      await prisma.prospect.update({
        where: { id: data.prospectId },
        data: { status: "Not Interested" }
      });
    }

    // Update progress
    await prisma.progress.update({
      where: { userId: user.id },
      data: { hasProposal: true }
    });

    return NextResponse.json({ message: "Proposal saved", proposal: savedProposal }, { status: 200 });
  } catch (error) {
    console.error("Save proposal error:", error);
    return NextResponse.json({ message: "An error occurred" }, { status: 500 });
  }
}
