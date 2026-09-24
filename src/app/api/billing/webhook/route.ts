import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("x-signature") || "";
    const secret = process.env.LEMON_SQUEEZY_WEBHOOK_SECRET || "";

    if (!secret) {
      console.error("[Webhook] LEMON_SQUEEZY_WEBHOOK_SECRET is not configured");
      return NextResponse.json({ message: "Webhook secret missing" }, { status: 500 });
    }

    const hmac = crypto.createHmac("sha256", secret);
    const digest = Buffer.from(hmac.update(rawBody).digest("hex"), "utf8");
    const signatureBuffer = Buffer.from(signature, "utf8");

    if (digest.length !== signatureBuffer.length || !crypto.timingSafeEqual(digest, signatureBuffer)) {
      return NextResponse.json({ message: "Invalid signature" }, { status: 403 });
    }

    const payload = JSON.parse(rawBody);
    const eventName = payload.meta.event_name;
    const obj = payload.data.attributes;
    const customData = payload.meta.custom_data;

    console.log(`[Webhook] Received event: ${eventName}`);

    if (!customData || !customData.user_id) {
      console.log("[Webhook] Missing user_id in custom_data. Ignoring.");
      return NextResponse.json({ received: true });
    }

    const userId = customData.user_id;

    if (eventName.startsWith("subscription_")) {
      const subscriptionId = String(payload.data.id);
      const customerId = String(obj.customer_id);
      const storeId = String(obj.store_id);
      const productId = String(obj.product_id);
      const variantId = String(obj.variant_id);
      const orderId = String(obj.order_id);
      
      const status = obj.status; // e.g., 'active', 'cancelled', 'expired', 'past_due'
      const currentPeriodStart = new Date(obj.created_at);
      const currentPeriodEnd = new Date(obj.renews_at || obj.ends_at || obj.created_at);
      
      const updatePaymentMethodUrl = obj.urls?.update_payment_method || null;
      const customerPortalUrl = obj.urls?.customer_portal || null;
      
      const cancelAtPeriodEnd = obj.cancelled || false;
      const canceledAt = obj.cancelled_at ? new Date(obj.cancelled_at) : null;
      const endedAt = obj.ends_at ? new Date(obj.ends_at) : null;

      await prisma.subscription.upsert({
        where: { providerSubscriptionId: subscriptionId },
        update: {
          status,
          plan: "PRO",
          currentPeriodEnd,
          cancelAtPeriodEnd,
          canceledAt,
          endedAt,
          updatePaymentMethodUrl,
          customerPortalUrl
        },
        create: {
          userId,
          plan: "PRO",
          status,
          provider: "lemonsqueezy",
          providerCustomerId: customerId,
          providerSubscriptionId: subscriptionId,
          providerOrderId: orderId,
          providerStoreId: storeId,
          providerProductId: productId,
          providerVariantId: variantId,
          currentPeriodStart,
          currentPeriodEnd,
          cancelAtPeriodEnd,
          canceledAt,
          endedAt,
          updatePaymentMethodUrl,
          customerPortalUrl
        }
      });

      // Map Lemon Squeezy status to our app logic
      const activeStatuses = ["on_trial", "active", "past_due"];
      if (activeStatuses.includes(status)) {
        await prisma.user.update({
          where: { id: userId },
          data: { plan: "PRO" }
        });
        console.log(`[Webhook] User ${userId} plan set to PRO`);
      } else if (status === "cancelled") {
        // According to instructions: "CANCELLED -> preserve access until the subscription actually ends if Lemon Squeezy indicates an active paid period"
        // Lemon Squeezy sets status to 'cancelled' but gives an ends_at date. 
        // If endedAt is in the future, they still have access.
        const now = new Date();
        if (endedAt && endedAt > now) {
          // Still has access
          await prisma.user.update({
            where: { id: userId },
            data: { plan: "PRO" }
          });
          console.log(`[Webhook] User ${userId} cancelled but retains access until ${endedAt}`);
        } else {
          // Access expired
          await prisma.user.update({
            where: { id: userId },
            data: { plan: "FREE" }
          });
          console.log(`[Webhook] User ${userId} subscription expired/cancelled. Downgraded to FREE`);
        }
      } else if (status === "expired" || status === "unpaid") {
        await prisma.user.update({
          where: { id: userId },
          data: { plan: "FREE" }
        });
        console.log(`[Webhook] User ${userId} subscription ${status}. Downgraded to FREE`);
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook processing error:", error);
    return NextResponse.json({ message: "Webhook error" }, { status: 500 });
  }
}
