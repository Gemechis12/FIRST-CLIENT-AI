import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { ProposalsClient } from "./ProposalsClient";
import Link from "next/link";

export default async function ProposalsPage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.email) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: { 
      proposals: { 
        orderBy: { updatedAt: 'desc' },
        include: { prospect: true }
      }
    }
  });

  if (!user) redirect("/login");

  return (
    <div className="p-6 md:p-10 max-w-6xl mx-auto">
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2">Proposal Library</h1>
          <p className="text-[var(--muted-foreground)]">Manage and track all your generated proposals.</p>
        </div>
        
        <div className="flex gap-2">
          <Link href="/dashboard/proposal" className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-bold hover:bg-primary/90 transition-colors shadow-sm">
            Create New Proposal
          </Link>
        </div>
      </div>

      <ProposalsClient existingProposals={user.proposals} />
    </div>
  );
}
