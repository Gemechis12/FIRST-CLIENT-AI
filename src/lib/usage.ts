import { prisma } from "@/lib/prisma";
import { PLANS, LIMITS, Plan, ActionType, getCurrentPeriod } from "./plans";

export async function checkLimit(userId: string, action: ActionType) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { plan: true }
  });

  if (!user) return { allowed: false, message: "User not found" };

  const plan = (user.plan as Plan) || PLANS.FREE;
  const limit = LIMITS[plan][action];

  if (limit === undefined) return { allowed: false, message: "Invalid action" };

  const period = getCurrentPeriod();

  const usage = await prisma.aIUsage.findUnique({
    where: {
      userId_action_period: {
        userId,
        action,
        period
      }
    }
  });

  const count = usage?.count || 0;

  if (count >= limit) {
    return {
      allowed: false,
      message: `You've reached your monthly limit (${limit}) for this tool.`,
      action: "UPGRADE"
    };
  }

  return { allowed: true };
}

export async function incrementUsage(userId: string, action: ActionType) {
  const period = getCurrentPeriod();

  await prisma.aIUsage.upsert({
    where: {
      userId_action_period: {
        userId,
        action,
        period
      }
    },
    update: {
      count: { increment: 1 }
    },
    create: {
      userId,
      action,
      period,
      count: 1
    }
  });
}

export async function checkModelLimit(userId: string, modelType: "prospects" | "portfolioProjects" | "proposals") {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { plan: true }
  });

  if (!user) return { allowed: false, message: "User not found" };

  const plan = (user.plan as Plan) || PLANS.FREE;
  const limit = LIMITS[plan][modelType];

  let currentCount = 0;
  
  if (modelType === "prospects") {
    currentCount = await prisma.prospect.count({ where: { userId } });
  } else if (modelType === "portfolioProjects") {
    currentCount = await prisma.portfolioProject.count({ where: { userId } });
  } else if (modelType === "proposals") {
    currentCount = await prisma.proposal.count({ where: { userId } });
  }

  if (currentCount >= limit) {
    return {
      allowed: false,
      message: `You've reached your limit (${limit}) for this feature.`,
      action: "UPGRADE"
    };
  }

  return { allowed: true };
}
