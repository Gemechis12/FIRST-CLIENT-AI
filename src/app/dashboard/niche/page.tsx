import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { NicheFinderClient } from "./NicheFinderClient";
import { Target } from "lucide-react";
import Link from "next/link";

export default async function NicheFinderPage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.email) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: { services: { where: { isSelected: true } } }
  });

  if (!user?.services || user.services.length === 0) {
    return (
      <div className="p-6 md:p-10 max-w-4xl mx-auto text-center mt-20">
        <div className="w-16 h-16 bg-yellow-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <Target className="w-8 h-8 text-yellow-500" />
        </div>
        <h1 className="text-3xl font-bold mb-4">You need a service first.</h1>
        <p className="text-[var(--muted-foreground)] mb-8 text-lg">
          Please select a service before finding your niche.
        </p>
        <Link 
          href="/dashboard/service"
          className="px-8 py-4 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-colors inline-block"
        >
          Go to Service Finder
        </Link>
      </div>
    );
  }

  const serviceTitle = user.services[0].title;

  return (
    <div className="p-6 md:p-10 max-w-5xl mx-auto">
      <div className="mb-8">
        <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-medium text-primary mb-4">
          Step 3
        </div>
        <h1 className="text-3xl font-bold mb-2">Niche Finder</h1>
        <p className="text-[var(--muted-foreground)]">Let's find the most profitable audience for your service.</p>
      </div>

      <NicheFinderClient serviceTitle={serviceTitle} />
    </div>
  );
}
