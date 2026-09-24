import Link from "next/link";
import { Check, ArrowLeft, X } from "lucide-react";
import { PLAN_CONFIG, PLANS, LIMITS } from "@/lib/plans";
import { CheckoutButton } from "./CheckoutButton";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function PricingPage() {
  const session = await getServerSession(authOptions);
  
  let currentPlan = "FREE";
  if (session?.user?.email) {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });
    if (user) currentPlan = user.plan;
  }

  const freeConfig = PLAN_CONFIG[PLANS.FREE];
  const proConfig = PLAN_CONFIG[PLANS.PRO];

  return (
    <div className="min-h-screen bg-[var(--background)] flex flex-col items-center py-20 px-6">
      <div className="w-full max-w-6xl mb-12">
        <Link href={session ? "/dashboard" : "/"} className="inline-flex items-center text-sm font-medium text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" /> {session ? "Back to Dashboard" : "Back to Home"}
        </Link>
      </div>

      <div className="text-center mb-16 max-w-2xl">
        <h1 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight">Upgrade Your Freelance Business</h1>
        <p className="text-lg text-[var(--muted-foreground)]">
          Cancel anytime. Upgrade to Pro to unlock higher limits and land more clients.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 max-w-4xl w-full mb-20">
        {/* FREE PLAN */}
        <div className={`bg-[var(--card)] border ${currentPlan === 'FREE' ? 'border-primary' : 'border-[var(--border)]'} rounded-2xl p-8 shadow-sm flex flex-col relative`}>
          {currentPlan === 'FREE' && (
            <div className="absolute top-0 right-8 transform -translate-y-1/2 bg-[var(--muted)] text-[var(--foreground)] border border-[var(--border)] text-xs font-bold uppercase tracking-wider py-1 px-3 rounded-full">
              Current Plan
            </div>
          )}
          <h2 className="text-2xl font-bold mb-2">{freeConfig.name}</h2>
          <p className="text-[var(--muted-foreground)] mb-6">For freelancers getting started.</p>
          <div className="text-4xl font-bold mb-8">${freeConfig.price}<span className="text-lg text-[var(--muted-foreground)] font-normal">/{freeConfig.interval || 'month'}</span></div>
          
          <ul className="space-y-4 mb-8 flex-1">
            <li className="flex items-start gap-3 text-sm"><Check className="w-5 h-5 text-green-500 shrink-0" /> Core workflow</li>
            <li className="flex items-start gap-3 text-sm"><Check className="w-5 h-5 text-green-500 shrink-0" /> {LIMITS[PLANS.FREE].service_generation} AI Generations per tool (Service, Niche, Offer, Portfolio)</li>
            <li className="flex items-start gap-3 text-sm"><Check className="w-5 h-5 text-green-500 shrink-0" /> {LIMITS[PLANS.FREE].outreach_generation} Outreach generations/mo</li>
            <li className="flex items-start gap-3 text-sm"><Check className="w-5 h-5 text-green-500 shrink-0" /> {LIMITS[PLANS.FREE].proposal_generation} Proposal generations/mo</li>
            <li className="flex items-start gap-3 text-sm"><Check className="w-5 h-5 text-green-500 shrink-0" /> {LIMITS[PLANS.FREE].prospects} Prospect tracking limit</li>
          </ul>

          <button disabled className="w-full py-3 bg-[var(--muted)] text-[var(--muted-foreground)] rounded-xl font-bold cursor-not-allowed">
            {currentPlan === 'FREE' ? 'Current Plan' : 'Included'}
          </button>
        </div>

        {/* PRO PLAN */}
        <div className={`bg-gradient-to-b from-primary/10 to-[var(--card)] border-2 ${currentPlan === 'PRO' ? 'border-green-500' : 'border-primary'} rounded-2xl p-8 shadow-md flex flex-col relative scale-105`}>
          {currentPlan === 'PRO' ? (
            <div className="absolute top-0 right-8 transform -translate-y-1/2 bg-green-500 text-white text-xs font-bold uppercase tracking-wider py-1 px-3 rounded-full">
              Current Plan
            </div>
          ) : (
            <div className="absolute top-0 right-8 transform -translate-y-1/2 bg-primary text-white text-xs font-bold uppercase tracking-wider py-1 px-3 rounded-full">
              Recommended
            </div>
          )}
          <h2 className="text-2xl font-bold mb-2">{proConfig.name}</h2>
          <p className="text-[var(--muted-foreground)] mb-6">For freelancers actively building their client pipeline.</p>
          <div className="text-4xl font-bold mb-8">${proConfig.price}<span className="text-lg text-[var(--muted-foreground)] font-normal">/{proConfig.interval}</span></div>
          
          <ul className="space-y-4 mb-8 flex-1">
            <li className="flex items-start gap-3 text-sm font-medium"><Check className="w-5 h-5 text-primary shrink-0" /> Higher AI Limits ({LIMITS[PLANS.PRO].service_generation}/mo per tool)</li>
            <li className="flex items-start gap-3 text-sm font-medium"><Check className="w-5 h-5 text-primary shrink-0" /> {LIMITS[PLANS.PRO].outreach_generation} Outreach generations/mo</li>
            <li className="flex items-start gap-3 text-sm font-medium"><Check className="w-5 h-5 text-primary shrink-0" /> {LIMITS[PLANS.PRO].proposal_generation} Proposal generations/mo</li>
            <li className="flex items-start gap-3 text-sm font-medium"><Check className="w-5 h-5 text-primary shrink-0" /> Unlimited Prospect tracking</li>
            <li className="flex items-start gap-3 text-sm font-medium"><Check className="w-5 h-5 text-primary shrink-0" /> Unlimited Saved Portfolios & Proposals</li>
            <li className="flex items-start gap-3 text-sm font-medium"><Check className="w-5 h-5 text-primary shrink-0" /> Priority Support</li>
          </ul>

          {currentPlan === 'PRO' ? (
            <button disabled className="w-full py-3 bg-green-500 text-white rounded-xl font-bold cursor-not-allowed">
              Active Subscription
            </button>
          ) : (
            session ? (
              <CheckoutButton planId={PLANS.PRO} price={proConfig.price} />
            ) : (
              <Link href="/login" className="w-full py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-all flex items-center justify-center">
                Log in to Upgrade
              </Link>
            )
          )}
        </div>
      </div>

      <div className="w-full max-w-4xl">
        <h3 className="text-2xl font-bold mb-8 text-center">Compare Plans</h3>
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl overflow-hidden shadow-sm">
          <table className="w-full text-sm text-left">
            <thead className="bg-[var(--muted)]/50 text-[var(--muted-foreground)] border-b border-[var(--border)]">
              <tr>
                <th className="px-6 py-4 font-bold text-sm">Feature</th>
                <th className="px-6 py-4 font-bold text-sm text-center w-1/4">FREE</th>
                <th className="px-6 py-4 font-bold text-sm text-center w-1/4 text-primary">PRO</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              <tr>
                <td className="px-6 py-4 font-medium">Service Finder</td>
                <td className="px-6 py-4 text-center text-[var(--muted-foreground)]">Limited ({LIMITS[PLANS.FREE].service_generation}/mo)</td>
                <td className="px-6 py-4 text-center font-bold">Higher limits ({LIMITS[PLANS.PRO].service_generation}/mo)</td>
              </tr>
              <tr>
                <td className="px-6 py-4 font-medium">Niche Finder</td>
                <td className="px-6 py-4 text-center text-[var(--muted-foreground)]">Limited ({LIMITS[PLANS.FREE].niche_generation}/mo)</td>
                <td className="px-6 py-4 text-center font-bold">Higher limits ({LIMITS[PLANS.PRO].niche_generation}/mo)</td>
              </tr>
              <tr>
                <td className="px-6 py-4 font-medium">Offer Builder</td>
                <td className="px-6 py-4 text-center text-[var(--muted-foreground)]">Limited ({LIMITS[PLANS.FREE].offer_generation}/mo)</td>
                <td className="px-6 py-4 text-center font-bold">Higher limits ({LIMITS[PLANS.PRO].offer_generation}/mo)</td>
              </tr>
              <tr>
                <td className="px-6 py-4 font-medium">Portfolio Builder</td>
                <td className="px-6 py-4 text-center text-[var(--muted-foreground)]">Limited ({LIMITS[PLANS.FREE].portfolio_generation}/mo)</td>
                <td className="px-6 py-4 text-center font-bold">Higher limits ({LIMITS[PLANS.PRO].portfolio_generation}/mo)</td>
              </tr>
              <tr>
                <td className="px-6 py-4 font-medium">Prospects</td>
                <td className="px-6 py-4 text-center text-[var(--muted-foreground)]">Limited ({LIMITS[PLANS.FREE].prospects})</td>
                <td className="px-6 py-4 text-center font-bold">Expanded (Unlimited)</td>
              </tr>
              <tr>
                <td className="px-6 py-4 font-medium">Outreach</td>
                <td className="px-6 py-4 text-center text-[var(--muted-foreground)]">Limited ({LIMITS[PLANS.FREE].outreach_generation}/mo)</td>
                <td className="px-6 py-4 text-center font-bold">Higher limits ({LIMITS[PLANS.PRO].outreach_generation}/mo)</td>
              </tr>
              <tr>
                <td className="px-6 py-4 font-medium">Proposals</td>
                <td className="px-6 py-4 text-center text-[var(--muted-foreground)]">Limited ({LIMITS[PLANS.FREE].proposal_generation}/mo)</td>
                <td className="px-6 py-4 text-center font-bold">Higher limits ({LIMITS[PLANS.PRO].proposal_generation}/mo)</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
