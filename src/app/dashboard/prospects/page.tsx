import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { ProspectsClient } from "./ProspectsClient";
import { LayoutTemplate } from "lucide-react";
import Link from "next/link";

export default async function ProspectsPage() {
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
      offers: { take: 1, orderBy: { updatedAt: 'desc' } },
      prospects: { orderBy: { updatedAt: 'desc' } }
    }
  });

  if (!user?.onboarding?.isCompleted || user.services.length === 0 || user.niches.length === 0 || user.offers.length === 0) {
    return (
      <div className="p-6 md:p-10 max-w-4xl mx-auto text-center mt-20">
        <div className="w-16 h-16 bg-yellow-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <LayoutTemplate className="w-8 h-8 text-yellow-500" />
        </div>
        <h1 className="text-3xl font-bold mb-4">Complete your offer first.</h1>
        <p className="text-[var(--muted-foreground)] mb-8 text-lg">
          You need a complete offer before you can start prospecting.
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
    niche: user.niches[0].name,
    offerTitle: user.offers[0].headline
  };

  return (
    <div className="p-6 md:p-10 max-w-6xl mx-auto">
      <div className="mb-8">
        <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-medium text-primary mb-4">
          Step 6
        </div>
        <h1 className="text-3xl font-bold mb-2">Build Your Prospect List</h1>
        <p className="text-[var(--muted-foreground)]">Find businesses or people who could benefit from your service.</p>
      </div>

      <ProspectsClient existingProspects={user.prospects} userContext={userContext} />
    </div>
  );
}
