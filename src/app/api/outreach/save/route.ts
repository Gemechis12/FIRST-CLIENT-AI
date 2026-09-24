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

    const { prospectId, messageType, platform, content, subject, markAsSent } = await req.json();

    if (!prospectId || !content) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
    }

    // Save message
    const savedMessage = await prisma.outreachMessage.create({
      data: {
        userId: user.id,
        prospectId,
        messageType,
        platform,
        content,
        subject
      }
    });

    // If marked as sent, update the prospect's status if it is currently "New"
    if (markAsSent) {
      const prospect = await prisma.prospect.findUnique({
        where: { id: prospectId }
      });
      
      if (prospect && prospect.status === "New") {
        await prisma.prospect.update({
          where: { id: prospectId },
          data: { status: "Contacted" }
        });
      }
    }

    // Update progress
    await prisma.progress.update({
      where: { userId: user.id },
      data: { hasOutreach: true }
    });

    return NextResponse.json({ message: "Outreach saved", outreachMessage: savedMessage }, { status: 200 });
  } catch (error) {
    console.error("Save outreach error:", error);
    return NextResponse.json({ message: "An error occurred" }, { status: 500 });
  }
}
