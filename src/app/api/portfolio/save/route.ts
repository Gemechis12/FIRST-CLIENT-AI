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

    let savedProject;
    
    if (data.id) {
      // Update existing project
      savedProject = await prisma.portfolioProject.update({
        where: { id: data.id, userId: user.id }, // ensure it belongs to user
        data: {
          title: data.title,
          practiceClient: data.practiceClient,
          industry: data.industry,
          background: data.background,
          problem: data.problem,
          goal: data.goal,
          targetAudience: data.targetAudience,
          creativeDirection: data.creativeDirection,
          deliverables: data.deliverables,
          suggestedTools: data.suggestedTools,
          successCriteria: data.successCriteria,
          portfolioDescription: data.portfolioDescription,
        }
      });
    } else {
      // Create new project
      const limitCheck = await checkModelLimit(user.id, "portfolioProjects");
      if (!limitCheck.allowed) {
        return NextResponse.json({ error: "LIMIT_REACHED", message: limitCheck.message, action: limitCheck.action }, { status: 403 });
      }

      savedProject = await prisma.portfolioProject.create({
        data: {
          userId: user.id,
          title: data.title,
          practiceClient: data.practiceClient,
          industry: data.industry,
          background: data.background,
          problem: data.problem,
          goal: data.goal,
          targetAudience: data.targetAudience,
          creativeDirection: data.creativeDirection,
          deliverables: data.deliverables,
          suggestedTools: data.suggestedTools,
          successCriteria: data.successCriteria,
          portfolioDescription: data.portfolioDescription,
          isPracticeProject: true
        }
      });
    }

    // Update progress
    await prisma.progress.update({
      where: { userId: user.id },
      data: { hasPortfolio: true }
    });

    return NextResponse.json({ message: "Project saved", project: savedProject }, { status: 200 });
  } catch (error) {
    console.error("Save portfolio project error:", error);
    return NextResponse.json({ message: "An error occurred" }, { status: 500 });
  }
}
