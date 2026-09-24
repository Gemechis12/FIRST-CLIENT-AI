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

    let savedProspect;
    
    if (data.id) {
      // Update existing
      savedProspect = await prisma.prospect.update({
        where: { id: data.id, userId: user.id },
        data: {
          name: data.name,
          industry: data.industry,
          website: data.website,
          socialUrl: data.socialUrl,
          platform: data.platform,
          location: data.location,
          contactName: data.contactName,
          contactEmail: data.contactEmail,
          observedProblem: data.observedProblem,
          notes: data.notes,
          status: data.status || "New"
        }
      });
    } else {
      // Create new
      const limitCheck = await checkModelLimit(user.id, "prospects");
      if (!limitCheck.allowed) {
        return NextResponse.json({ error: "LIMIT_REACHED", message: limitCheck.message, action: limitCheck.action }, { status: 403 });
      }

      savedProspect = await prisma.prospect.create({
        data: {
          userId: user.id,
          name: data.name,
          industry: data.industry,
          website: data.website,
          socialUrl: data.socialUrl,
          platform: data.platform,
          location: data.location,
          contactName: data.contactName,
          contactEmail: data.contactEmail,
          observedProblem: data.observedProblem,
          notes: data.notes,
          status: "New"
        }
      });
    }

    // Update progress when they add their first prospect
    await prisma.progress.update({
      where: { userId: user.id },
      data: { hasProspects: true }
    });

    return NextResponse.json({ message: "Prospect saved", prospect: savedProspect }, { status: 200 });
  } catch (error) {
    console.error("Save prospect error:", error);
    return NextResponse.json({ message: "An error occurred" }, { status: 500 });
  }
}
