import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { ProposalDetailClient } from "./ProposalDetailClient";

export default async function ProposalDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { email: session.user.email }
  });

  if (!user) redirect("/login");

  const proposal = await prisma.proposal.findUnique({
    where: { id: resolvedParams.id, userId: user.id },
    include: { prospect: true }
  });

  if (!proposal) {
    redirect("/dashboard/proposals");
  }

  return (
    <div className="p-6 md:p-10 max-w-4xl mx-auto">
      <ProposalDetailClient proposal={proposal} />
    </div>
  );
}
