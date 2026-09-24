import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { ProposalClient } from "./ProposalClient";
import { FileText } from "lucide-react";
import Link from "next/link";

export default async function ProposalPage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.email) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: { 
      onboarding: true,
      services: { where: { isSelected: true } },
      offers: { orderBy: { updatedAt: 'desc' } },
      prospects: { orderBy: { updatedAt: 'desc' } }
    }
  });

  if (!user?.onboarding?.isCompleted || user.offers.length === 0) {
    return (
      <div className="p-6 md:p-10 max-w-4xl mx-auto text-center mt-20">
        <div className="w-16 h-16 bg-yellow-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <FileText className="w-8 h-8 text-yellow-500" />
        </div>
        <h1 className="text-3xl font-bold mb-4">Complete your offer first.</h1>
        <p className="text-[var(--muted-foreground)] mb-8 text-lg">
          You need an offer to build a proposal around.
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

  return (
    <div className="p-6 md:p-10 max-w-6xl mx-auto">
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-medium text-primary mb-4">
            Step 8
          </div>
          <h1 className="text-3xl font-bold mb-2">Turn Interest Into a Proposal</h1>
          <p className="text-[var(--muted-foreground)]">Create a professional proposal using your offer, prospect, and project details.</p>
        </div>
        
        <div className="flex gap-2">
          <Link href="/dashboard/proposals" className="px-4 py-2 border border-[var(--border)] rounded-lg text-sm font-bold hover:bg-[var(--muted)] transition-colors">
            View All Proposals
          </Link>
        </div>
      </div>

      <ProposalClient prospects={user.prospects} offers={user.offers} />
    </div>
  );
}
