import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { CreditCard, CheckCircle2 } from "lucide-react";

export default async function BillingPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: { subscriptions: { orderBy: { createdAt: 'desc' }, take: 1 } }
  });

  if (!user) redirect("/login");

  const currentPlan = user.plan;
  const latestSubscription = user.subscriptions[0];
  
  // Format dates securely
  const formatDates = (date: Date) => {
    return date.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  };

  return (
    <div className="p-6 md:p-10 max-w-4xl mx-auto space-y-10 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold mb-2">Billing & Subscription</h1>
        <p className="text-[var(--muted-foreground)]">Manage your plan and payment methods.</p>
      </div>

      <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl overflow-hidden shadow-sm">
        <div className="p-6 md:p-8 border-b border-[var(--border)] flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-xl font-bold flex items-center gap-2 mb-1">
              <CreditCard className="w-5 h-5 text-primary" /> Current Plan
            </h2>
            <div className="flex items-center gap-3">
              <span className="text-2xl font-bold">{currentPlan}</span>
              {currentPlan === "PRO" && latestSubscription?.status === "ACTIVE" && (
                <span className="bg-green-500/10 text-green-600 border border-green-500/20 text-xs px-2.5 py-1 rounded-full font-bold uppercase tracking-wider flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Active
                </span>
              )}
            </div>
          </div>
          
          <div>
            {currentPlan === "FREE" ? (
              <Link 
                href="/pricing" 
                className="px-6 py-2 bg-primary text-white rounded-lg font-bold hover:bg-primary/90 transition-all shadow-md inline-block text-center"
              >
                Upgrade to Pro
              </Link>
            ) : (
              latestSubscription?.customerPortalUrl ? (
                <a 
                  href={latestSubscription.customerPortalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-2 border border-primary text-primary rounded-lg font-bold hover:bg-primary/5 transition-all inline-block text-center"
                >
                  Manage Subscription
                </a>
              ) : (
                <button 
                  disabled 
                  className="px-6 py-2 bg-[var(--muted)] text-[var(--muted-foreground)] rounded-lg font-bold cursor-not-allowed border border-[var(--border)]"
                >
                  Pro Subscription Active
                </button>
              )
            )}
          </div>
        </div>
        
        {latestSubscription && currentPlan === "PRO" && (
          <div className="p-6 md:p-8 bg-[var(--muted)]/20">
            <h3 className="font-bold mb-4 uppercase tracking-wider text-xs text-[var(--muted-foreground)]">Subscription Details</h3>
            
            <div className="grid sm:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-[var(--muted-foreground)] mb-1">Status</p>
                <p className="font-medium capitalize">{latestSubscription.status.toLowerCase()}</p>
              </div>
              <div>
                <p className="text-sm text-[var(--muted-foreground)] mb-1">Next Billing Date</p>
                <p className="font-medium">
                  {latestSubscription.currentPeriodEnd 
                    ? formatDates(latestSubscription.currentPeriodEnd)
                    : "N/A"
                  }
                </p>
              </div>
            </div>
          </div>
        )}

        {currentPlan === "FREE" && (
          <div className="p-6 md:p-8 bg-[var(--muted)]/20">
            <p className="text-[var(--muted-foreground)] text-sm">
              You are currently on the Free plan. Upgrade to Pro to get access to higher AI generation limits and unlimited prospect tracking.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
