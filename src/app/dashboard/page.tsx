import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { redirect } from "next/navigation";
import { 
  Briefcase, 
  Target, 
  LayoutTemplate, 
  FileText, 
  MessageSquare, 
  CheckCircle2,
  ArrowRight,
  Play,
  Sparkles
} from "lucide-react";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.email) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: {
      onboarding: true,
      progress: true,
      services: { where: { isSelected: true } },
      niches: { where: { isSelected: true } },
      prospects: true,
      usage: { 
        where: { 
          period: `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}` 
        } 
      }
    }
  });

  if (!user?.onboarding?.isCompleted) {
    redirect("/onboarding");
  }

  const progress = user.progress || {
    hasSkill: true,
    hasService: false,
    hasNiche: false,
    hasOffer: false,
    hasPortfolio: false,
    hasProspects: false,
    hasOutreach: false,
    hasProposal: false,
  };
  
  const hasWonClient = user.prospects.some(p => p.status === "Won");

  // Calculate actual percentage (out of 8 main steps)
  const steps = [
    { id: "skill", key: "hasSkill" },
    { id: "service", key: "hasService" },
    { id: "niche", key: "hasNiche" },
    { id: "offer", key: "hasOffer" },
    { id: "portfolio", key: "hasPortfolio" },
    { id: "outreach", key: "hasOutreach" },
    { id: "proposal", key: "hasProposal" }
  ];
  
  const completedSteps = steps.filter(s => (progress as any)[s.key]).length + (hasWonClient ? 1 : 0);
  const actualPercentage = Math.round((completedSteps / (steps.length + 1)) * 100);

  const workflowSteps = [
    { id: "skill", title: "Identify Skill", status: progress.hasSkill ? "completed" : "current", icon: Sparkles, href: "/dashboard/service", subtitle: user.onboarding.skill },
    { id: "service", title: "Define Service", status: progress.hasService ? "completed" : (!progress.hasSkill ? "pending" : "current"), icon: Briefcase, href: "/dashboard/service", subtitle: user.services[0]?.title },
    { id: "niche", title: "Find Niche", status: progress.hasNiche ? "completed" : (!progress.hasService ? "pending" : "current"), icon: Target, href: "/dashboard/niche", subtitle: user.niches[0]?.name },
    { id: "offer", title: "Build Offer", status: progress.hasOffer ? "completed" : (!progress.hasNiche ? "pending" : "current"), icon: LayoutTemplate, href: "/dashboard/offer" },
    { id: "portfolio", title: "Create Portfolio", status: progress.hasPortfolio ? "completed" : (!progress.hasOffer ? "pending" : "current"), icon: FileText, href: "/dashboard/portfolio" },
    { id: "outreach", title: "Generate Outreach", status: progress.hasOutreach ? "completed" : (!progress.hasPortfolio ? "pending" : "current"), icon: MessageSquare, href: "/dashboard/prospects" },
    { id: "client", title: "First Client", status: hasWonClient ? "completed" : (!progress.hasProposal ? "pending" : "current"), icon: CheckCircle2, href: "/dashboard/prospects" },
  ];

  let currentStepIndex = workflowSteps.findIndex(s => s.status === "current");
  const isFullyComplete = hasWonClient && currentStepIndex === -1;
  const currentStep = isFullyComplete ? workflowSteps[workflowSteps.length - 1] : (workflowSteps[currentStepIndex] || workflowSteps[0]);

  const aiGenerationsUsed = user.usage?.reduce((acc, curr) => acc + curr.count, 0) || 0;
  const isPro = user.plan === "PRO";

  return (
    <div className="p-6 md:p-10 max-w-6xl mx-auto space-y-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2">Welcome back, {user.name?.split(' ')[0] || 'Freelancer'}!</h1>
          <p className="text-[var(--muted-foreground)]">Let's continue building your freelance business.</p>
        </div>
        <div className="flex flex-col sm:items-end bg-[var(--card)] border border-[var(--border)] px-4 py-3 rounded-xl shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-[var(--muted-foreground)] uppercase tracking-wider">Current Plan:</span>
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${isPro ? 'bg-primary/10 text-primary' : 'bg-[var(--muted)] text-[var(--foreground)]'}`}>
              {user.plan}
            </span>
            {!isPro && (
              <Link href="/pricing" className="text-xs font-bold text-primary hover:underline ml-1">Upgrade</Link>
            )}
          </div>
          <p className="text-xs text-[var(--muted-foreground)]">
            <span className="font-bold text-[var(--foreground)]">{aiGenerationsUsed}</span> AI Generations this month
          </p>
        </div>
      </div>

      <div className="bg-gradient-to-r from-primary/10 via-[var(--card)] to-[var(--card)] border border-[var(--border)] rounded-2xl p-8 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-2 h-full bg-primary"></div>
        <div className="flex-1">
          <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-medium text-primary mb-4">
            {isFullyComplete ? "Workflow Complete" : "Next Action"}
          </div>
          <h2 className="text-2xl font-bold mb-2">{isFullyComplete ? "You're ready to start reaching out to clients." : currentStep.title}</h2>
          <p className="text-[var(--muted-foreground)] mb-6 max-w-lg">
            {isFullyComplete 
              ? "You've successfully built your entire freelance foundation. Keep tracking your outreach and sending proposals to land that first client!" 
              : "Complete this step to move closer to landing your first client."}
          </p>
          <Link
            href={isFullyComplete ? "/dashboard/prospects" : currentStep.href}
            className="inline-flex h-10 items-center justify-center rounded-lg bg-primary px-6 text-sm font-medium text-white shadow hover:bg-primary/90 transition-all"
          >
            <Play className="w-4 h-4 mr-2" />
            {isFullyComplete ? "Manage Prospects" : "Continue"}
          </Link>
        </div>
        
        <div className="w-32 h-32 rounded-full border-8 border-[var(--muted)] border-t-primary border-r-primary flex items-center justify-center rotate-45 shrink-0 transition-all duration-1000 ease-in-out">
          <div className="-rotate-45 text-center">
            <span className="text-3xl font-bold">{actualPercentage}%</span>
          </div>
        </div>
      </div>

      {user.prospects && user.prospects.length > 0 && (
        <div>
          <h2 className="text-xl font-bold mb-6">Your Pipeline</h2>
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            <div className="bg-[var(--card)] border border-[var(--border)] p-4 rounded-xl shadow-sm text-center">
              <p className="text-2xl font-bold text-[var(--foreground)]">{user.prospects.length}</p>
              <p className="text-[10px] font-bold text-[var(--muted-foreground)] uppercase tracking-wider mt-1">Prospects</p>
            </div>
            <div className="bg-[var(--card)] border border-[var(--border)] p-4 rounded-xl shadow-sm text-center">
              <p className="text-2xl font-bold text-blue-500">{user.prospects.filter((p: any) => p.status === 'Contacted').length}</p>
              <p className="text-[10px] font-bold text-[var(--muted-foreground)] uppercase tracking-wider mt-1">Contacted</p>
            </div>
            <div className="bg-[var(--card)] border border-[var(--border)] p-4 rounded-xl shadow-sm text-center">
              <p className="text-2xl font-bold text-purple-500">{user.prospects.filter((p: any) => p.status === 'Replied').length}</p>
              <p className="text-[10px] font-bold text-[var(--muted-foreground)] uppercase tracking-wider mt-1">Replies</p>
            </div>
            <div className="bg-[var(--card)] border border-[var(--border)] p-4 rounded-xl shadow-sm text-center">
              <p className="text-2xl font-bold text-yellow-500">{user.prospects.filter((p: any) => p.status === 'Interested').length}</p>
              <p className="text-[10px] font-bold text-[var(--muted-foreground)] uppercase tracking-wider mt-1">Interested</p>
            </div>
            <div className="bg-[var(--card)] border border-[var(--border)] p-4 rounded-xl shadow-sm text-center">
              <p className="text-2xl font-bold text-orange-500">{user.prospects.filter((p: any) => p.status === 'Proposal Sent').length}</p>
              <p className="text-[10px] font-bold text-[var(--muted-foreground)] uppercase tracking-wider mt-1">Proposals</p>
            </div>
            <div className="bg-[var(--card)] border border-green-500/30 p-4 rounded-xl shadow-sm text-center">
              <p className="text-2xl font-bold text-green-600">{user.prospects.filter((p: any) => p.status === 'Won').length}</p>
              <p className="text-[10px] font-bold text-green-600 uppercase tracking-wider mt-1">Won</p>
            </div>
          </div>
        </div>
      )}

      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">Freelance Launch Roadmap</h2>
        </div>
        
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-6 shadow-sm">
          <div className="relative">
            <div className="absolute left-[23px] top-4 bottom-4 w-[2px] bg-[var(--border)] z-0"></div>
            
            <div className="space-y-8 relative z-10">
              {workflowSteps.map((step, index) => (
                <div key={step.id} className="flex gap-4">
                  <div className={`
                    w-12 h-12 rounded-full flex items-center justify-center shrink-0 border-2 transition-all
                    ${step.status === 'completed' ? 'bg-primary border-primary text-white' : 
                      step.status === 'current' ? 'bg-[var(--card)] border-primary text-primary shadow-[0_0_15px_rgba(99,102,241,0.3)]' : 
                      'bg-[var(--card)] border-[var(--border)] text-[var(--muted-foreground)]'}
                  `}>
                    {step.status === 'completed' ? <CheckCircle2 className="w-6 h-6" /> : <step.icon className="w-5 h-5" />}
                  </div>
                  
                  <div className={`flex-1 pt-3 pb-8 ${index !== workflowSteps.length - 1 ? 'border-b border-[var(--border)]/50' : ''}`}>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <h3 className={`font-bold text-lg ${step.status === 'pending' ? 'text-[var(--muted-foreground)]' : ''}`}>
                          {index + 1}. {step.title}
                        </h3>
                        {step.subtitle && (
                          <p className={`text-sm font-medium mt-1 ${step.status === 'pending' ? 'text-[var(--muted-foreground)]' : 'text-primary'}`}>
                            {step.subtitle}
                          </p>
                        )}
                      </div>
                      
                      {(step.status === 'completed' || step.status === 'current') && (
                        <Link 
                          href={step.href}
                          className={`inline-flex items-center text-sm font-medium ${step.status === 'completed' ? 'text-[var(--muted-foreground)] hover:text-primary' : 'text-primary'}`}
                        >
                          {step.status === 'completed' ? 'Review' : 'Start'}
                          <ArrowRight className="w-4 h-4 ml-1" />
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
