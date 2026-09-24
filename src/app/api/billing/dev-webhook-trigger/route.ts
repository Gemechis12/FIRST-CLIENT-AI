import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json({ message: "Not available in production" }, { status: 403 });
  }

  try {
    const { email, plan } = await req.json();

    if (!email || !plan) {
      return NextResponse.json({ message: "Missing metadata" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // Update Subscription
    await prisma.subscription.create({
      data: {
        userId: user.id,
        plan: plan,
        status: "ACTIVE",
        provider: "dev_mock_provider",
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) 
      }
    });

    // Update User
    await prisma.user.update({
      where: { id: user.id },
      data: { plan: plan }
    });

    console.log(`[DEV MODE] Successfully simulated webhook for user ${email} to plan ${plan}`);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DEV Webhook error:", error);
    return NextResponse.json({ message: "Error" }, { status: 500 });
  }
}
