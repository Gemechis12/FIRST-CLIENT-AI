import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { ServiceFinderClient } from "./ServiceFinderClient";

export default async function ServiceFinderPage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.email) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: { onboarding: true }
  });

  if (!user?.onboarding?.isCompleted) {
    redirect("/onboarding");
  }

  const skill = user.onboarding.skill;

  return (
    <div className="p-6 md:p-10 max-w-4xl mx-auto">
      <div className="mb-8">
        <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-medium text-primary mb-4">
          Step 2
        </div>
        <h1 className="text-3xl font-bold mb-2">Turn Your Skill Into a Service</h1>
        <p className="text-[var(--muted-foreground)]">Your skill is valuable. Let's turn it into a service someone can actually buy.</p>
      </div>

      <ServiceFinderClient initialSkill={skill} />
    </div>
  );
}
