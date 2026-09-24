import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    if (user.plan === "PRO") {
      return NextResponse.json({ message: "You are already on the PRO plan." }, { status: 400 });
    }

    const storeId = process.env.LEMON_SQUEEZY_STORE_ID;
    const variantId = process.env.LEMON_SQUEEZY_PRO_VARIANT_ID;
    const apiKey = process.env.LEMON_SQUEEZY_API_KEY;

    if (!storeId || !variantId || !apiKey) {
      return NextResponse.json({ message: "Billing is not fully configured" }, { status: 500 });
    }

    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';

    const reqBody = {
      data: {
        type: "checkouts",
        attributes: {
          checkout_data: {
            email: user.email,
            custom: {
              user_id: user.id
            }
          },
          product_options: {
            redirect_url: `${baseUrl}/billing/success`,
            receipt_button_text: "Return to Dashboard",
            receipt_link_url: `${baseUrl}/dashboard`
          }
        },
        relationships: {
          store: {
            data: {
              type: "stores",
              id: storeId.toString()
            }
          },
          variant: {
            data: {
              type: "variants",
              id: variantId.toString()
            }
          }
        }
      }
    };

    const res = await fetch("https://api.lemonsqueezy.com/v1/checkouts", {
      method: "POST",
      headers: {
        "Accept": "application/vnd.api+json",
        "Content-Type": "application/vnd.api+json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify(reqBody)
    });

    const data = await res.json();
    
    if (!res.ok) {
      console.error("Lemon Squeezy Checkout Error:", data);
      return NextResponse.json({ message: "Failed to create checkout session" }, { status: 500 });
    }

    return NextResponse.json({ 
      message: "Checkout session created",
      url: data.data.attributes.url
    });

  } catch (error) {
    console.error("Checkout error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
