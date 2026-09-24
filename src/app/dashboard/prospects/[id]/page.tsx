import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, MessageSquare, ExternalLink, Mail, User as UserIcon, Send } from "lucide-react";

export default async function ProspectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { email: session.user.email }
  });

  if (!user) redirect("/login");

  const prospect = await prisma.prospect.findUnique({
    where: { id: resolvedParams.id, userId: user.id },
    include: { outreachMessages: { orderBy: { createdAt: 'desc' } } }
  });

  if (!prospect) {
    redirect("/dashboard/prospects");
  }

  // Pipeline steps
  const pipeline = ["New", "Contacted", "Replied", "Interested", "Proposal Sent", "Won"];
  const isLost = prospect.status === "Not Interested";

  return (
    <div className="p-6 md:p-10 max-w-6xl mx-auto space-y-8">
      <Link href="/dashboard/prospects" className="inline-flex items-center text-sm font-medium text-[var(--muted-foreground)] hover:text-[var(--foreground)]">
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Prospects
      </Link>

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-4xl font-bold">{prospect.name}</h1>
            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider
              ${prospect.status === 'New' ? 'bg-blue-500/10 text-blue-600' : 
                prospect.status === 'Won' ? 'bg-green-500/10 text-green-600' : 
                isLost ? 'bg-red-500/10 text-red-600' :
                'bg-purple-500/10 text-purple-600'}`}
            >
              {prospect.status}
            </span>
          </div>
          <p className="text-[var(--muted-foreground)] text-lg">
            {prospect.industry || "No Industry"} • {prospect.location || "No Location"}
          </p>
        </div>
        
        <div className="flex gap-2 flex-wrap justify-end">
          <Link 
            href={`/dashboard/outreach?prospectId=${prospect.id}`}
            className="px-6 py-3 bg-[var(--card)] border border-[var(--border)] text-[var(--foreground)] rounded-xl font-bold hover:bg-[var(--muted)] transition-colors flex items-center justify-center gap-2"
          >
            <MessageSquare className="w-5 h-5" /> Generate Outreach
          </Link>
          <Link 
            href={`/dashboard/proposal?prospectId=${prospect.id}`}
            className="px-6 py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 shadow-md"
          >
            Create Proposal
          </Link>
        </div>
      </div>

      {/* Pipeline Visual */}
      <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-6 shadow-sm overflow-x-auto">
        <div className="flex items-center min-w-[600px] justify-between relative">
          <div className="absolute left-6 right-6 top-1/2 -translate-y-1/2 h-1 bg-[var(--muted)] z-0 rounded-full"></div>
          {pipeline.map((step, index) => {
            const isCompleted = pipeline.indexOf(prospect.status) >= index;
            const isCurrent = prospect.status === step;
            return (
              <div key={step} className="relative z-10 flex flex-col items-center gap-2">
                <div className={`w-6 h-6 rounded-full border-4 ${
                  isCompleted ? 'bg-primary border-primary' : 'bg-[var(--card)] border-[var(--muted)]'
                }`}></div>
                <span className={`text-xs font-bold uppercase tracking-wider ${
                  isCurrent ? 'text-primary' : (isCompleted ? 'text-[var(--foreground)]' : 'text-[var(--muted-foreground)]')
                }`}>
                  {step}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        
        {/* Left Column: Details */}
        <div className="space-y-6 md:col-span-1">
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-6 shadow-sm space-y-6">
            <h3 className="font-bold text-lg border-b border-[var(--border)] pb-2">Contact Info</h3>
            
            <div className="space-y-4">
              {prospect.contactName && (
                <div className="flex items-start gap-3">
                  <UserIcon className="w-5 h-5 text-[var(--muted-foreground)] shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-bold text-[var(--muted-foreground)] uppercase tracking-wider">Contact Person</p>
                    <p className="font-medium">{prospect.contactName}</p>
                  </div>
                </div>
              )}
              {prospect.contactEmail && (
                <div className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-[var(--muted-foreground)] shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-bold text-[var(--muted-foreground)] uppercase tracking-wider">Email</p>
                    <a href={`mailto:${prospect.contactEmail}`} className="font-medium text-primary hover:underline">{prospect.contactEmail}</a>
                  </div>
                </div>
              )}
              {prospect.website && (
                <div className="flex items-start gap-3">
                  <ExternalLink className="w-5 h-5 text-[var(--muted-foreground)] shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-bold text-[var(--muted-foreground)] uppercase tracking-wider">Website</p>
                    <a href={prospect.website} target="_blank" rel="noreferrer" className="font-medium text-primary hover:underline line-clamp-1">{prospect.website}</a>
                  </div>
                </div>
              )}
              {prospect.socialUrl && (
                <div className="flex items-start gap-3">
                  <ExternalLink className="w-5 h-5 text-[var(--muted-foreground)] shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-bold text-[var(--muted-foreground)] uppercase tracking-wider">{prospect.platform} URL</p>
                    <a href={prospect.socialUrl} target="_blank" rel="noreferrer" className="font-medium text-primary hover:underline line-clamp-1">{prospect.socialUrl}</a>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-6 shadow-sm space-y-4">
            <h3 className="font-bold text-lg border-b border-[var(--border)] pb-2">Notes</h3>
            <div>
              <p className="text-xs font-bold text-[var(--muted-foreground)] uppercase tracking-wider mb-1">Observed Problem</p>
              <p className="text-sm bg-[var(--muted)]/50 p-3 rounded-lg">{prospect.observedProblem || "None recorded"}</p>
            </div>
            {prospect.notes && (
              <div>
                <p className="text-xs font-bold text-[var(--muted-foreground)] uppercase tracking-wider mb-1">Additional Notes</p>
                <p className="text-sm bg-[var(--muted)]/50 p-3 rounded-lg">{prospect.notes}</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Outreach History */}
        <div className="md:col-span-2 space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Outreach History</h2>
          </div>
          
          {prospect.outreachMessages.length === 0 ? (
            <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-10 text-center shadow-sm">
              <div className="w-16 h-16 bg-[var(--muted)] rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="w-8 h-8 text-[var(--muted-foreground)]" />
              </div>
              <h3 className="text-xl font-bold mb-2">No outreach sent yet.</h3>
              <p className="text-[var(--muted-foreground)] mb-6 max-w-sm mx-auto">
                Generate a personalized message tailored to {prospect.name}'s observed problem.
              </p>
              <Link 
                href={`/dashboard/outreach?prospectId=${prospect.id}`}
                className="px-6 py-3 bg-[var(--foreground)] text-[var(--background)] rounded-lg font-bold hover:bg-[var(--foreground)]/90 transition-colors inline-block shadow-sm"
              >
                Generate Message
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {prospect.outreachMessages.map((msg: any) => (
                <div key={msg.id} className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-6 shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1 h-full bg-green-500"></div>
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h4 className="font-bold text-lg flex items-center gap-2">
                        {msg.messageType}
                        <span className="bg-[var(--muted)] text-[var(--muted-foreground)] text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider">
                          {msg.platform}
                        </span>
                      </h4>
                      <p className="text-xs text-[var(--muted-foreground)] mt-1">
                        Saved on {new Date(msg.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <span className="bg-green-500/10 text-green-600 border border-green-500/20 text-xs px-2.5 py-1 rounded-full font-bold uppercase flex items-center gap-1">
                      <Send className="w-3 h-3" /> Sent
                    </span>
                  </div>
                  
                  {msg.subject && (
                    <p className="text-sm font-bold mb-2">Subject: {msg.subject}</p>
                  )}
                  <div className="bg-[var(--muted)]/30 p-4 rounded-lg text-sm whitespace-pre-wrap font-medium leading-relaxed">
                    {msg.content}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
