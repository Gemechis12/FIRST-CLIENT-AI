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

    // The user wants to allow multiple offers but for the workflow we can just have one primary offer or update the latest one.
    // Let's check if an offer already exists, if so update it, otherwise create.
    const existingOffer = await prisma.offer.findFirst({
      where: { userId: user.id }
    });

    let savedOffer;
    
    if (existingOffer) {
      savedOffer = await prisma.offer.update({
        where: { id: existingOffer.id },
        data: {
          headline: data.headline || data.title,
          targetCustomer: data.targetCustomer,
          problem: data.problem,
          solution: data.solution,
          deliverables: typeof data.deliverables === 'string' ? data.deliverables : JSON.stringify(data.deliverables),
          timeline: data.timeline,
          revisionPolicy: data.revisionPolicy,
          packagesData: typeof data.packages === 'string' ? data.packages : JSON.stringify(data.packages)
        }
      });
    } else {
      savedOffer = await prisma.offer.create({
        data: {
          userId: user.id,
          headline: data.headline || data.title,
          targetCustomer: data.targetCustomer,
          problem: data.problem,
          solution: data.solution,
          deliverables: typeof data.deliverables === 'string' ? data.deliverables : JSON.stringify(data.deliverables),
          timeline: data.timeline,
          revisionPolicy: data.revisionPolicy,
          packagesData: typeof data.packages === 'string' ? data.packages : JSON.stringify(data.packages)
        }
      });
    }

    // Update progress
    await prisma.progress.update({
      where: { userId: user.id },
      data: { hasOffer: true }
    });

    return NextResponse.json({ message: "Offer saved", offer: savedOffer }, { status: 200 });
  } catch (error) {
    console.error("Save offer error:", error);
    return NextResponse.json({ message: "An error occurred" }, { status: 500 });
  }
}
