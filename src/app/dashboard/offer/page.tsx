import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { OfferBuilderClient } from "./OfferBuilderClient";
import { LayoutTemplate } from "lucide-react";
import Link from "next/link";

export default async function OfferBuilderPage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.email) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: { 
      onboarding: true,
      services: { where: { isSelected: true } },
      niches: { where: { isSelected: true } },
      offers: { take: 1, orderBy: { updatedAt: 'desc' } }
    }
  });

  if (!user?.onboarding?.isCompleted || user.services.length === 0 || user.niches.length === 0) {
    return (
      <div className="p-6 md:p-10 max-w-4xl mx-auto text-center mt-20">
        <div className="w-16 h-16 bg-yellow-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <LayoutTemplate className="w-8 h-8 text-yellow-500" />
        </div>
        <h1 className="text-3xl font-bold mb-4">Complete previous steps first.</h1>
        <p className="text-[var(--muted-foreground)] mb-8 text-lg">
          You need a saved skill, service, and niche before you can build an offer.
        </p>
        <Link 
          href="/dashboard"
          className="px-8 py-4 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-colors inline-block"
        >
          Back to Dashboard
        </Link>
      </div>
    );
  }

  const userContext = {
    skill: user.onboarding.skill,
    service: user.services[0].title,
    niche: user.niches[0].name
  };

  const existingOffer = user.offers.length > 0 ? user.offers[0] : null;

  return (
    <div className="p-6 md:p-10 max-w-5xl mx-auto">
      <div className="mb-8">
        <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-medium text-primary mb-4">
          Step 4
        </div>
        <h1 className="text-3xl font-bold mb-2">Build an Offer People Can Buy</h1>
        <p className="text-[var(--muted-foreground)]">Turn your service and niche into a clear, valuable freelance offer.</p>
      </div>

      <OfferBuilderClient existingOffer={existingOffer} userContext={userContext} />
    </div>
  );
}
