"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Printer, Copy, Send, Check, Edit2 } from "lucide-react";
import Link from "next/link";

export function ProposalDetailClient({ proposal }: { proposal: any }) {
  const router = useRouter();
  const [copied, setCopied] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(proposal.content || "");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleStatusChange = async (newStatus: string) => {
    setSaving(true);
    try {
      const res = await fetch("/api/proposal/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: proposal.id,
          prospectId: proposal.prospectId,
          status: newStatus
        })
      });
      
      if (res.ok) {
        router.refresh();
      }
    } catch (error) {
      console.error(error);
    }
    setSaving(false);
  };

  return (
    <div className="space-y-8">
      {/* Hide controls when printing */}
      <div className="print:hidden flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-4">
          <Link href="/dashboard/proposals" className="inline-flex items-center text-sm font-medium text-[var(--muted-foreground)] hover:text-[var(--foreground)]">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Library
          </Link>
          <div>
            <h1 className="text-3xl font-bold mb-2">{proposal.title || "Proposal"}</h1>
            <div className="flex items-center gap-3">
              <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider
                ${proposal.status === 'Draft' ? 'bg-[var(--muted)] text-[var(--muted-foreground)]' : 
                  proposal.status === 'Ready' ? 'bg-blue-500/10 text-blue-600' : 
                  proposal.status === 'Sent' ? 'bg-purple-500/10 text-purple-600' : 
                  proposal.status === 'Accepted' ? 'bg-green-500/10 text-green-600' : 
                  'bg-red-500/10 text-red-600'}`}
              >
                {proposal.status}
              </span>
              <span className="text-[var(--muted-foreground)] text-sm">
                Last updated {new Date(proposal.updatedAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <button 
            onClick={handleCopy}
            className="px-4 py-2 border border-[var(--border)] bg-[var(--card)] rounded-lg text-sm font-bold hover:bg-[var(--muted)] transition-colors flex items-center gap-2"
          >
            {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
            {copied ? "Copied" : "Copy"}
          </button>
          <button 
            onClick={handlePrint}
            className="px-4 py-2 border border-[var(--border)] bg-[var(--card)] rounded-lg text-sm font-bold hover:bg-[var(--muted)] transition-colors flex items-center gap-2"
          >
            <Printer className="w-4 h-4" /> PDF / Print
          </button>
          
          <div className="relative group">
            <button className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-bold hover:bg-primary/90 transition-colors flex items-center gap-2">
              Update Status
            </button>
            <div className="absolute right-0 top-full mt-2 w-48 bg-[var(--card)] border border-[var(--border)] rounded-xl shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 overflow-hidden">
              <div className="flex flex-col">
                <button onClick={() => handleStatusChange("Sent")} className="px-4 py-3 text-left text-sm hover:bg-[var(--muted)] font-medium text-purple-600 border-b border-[var(--border)]">Mark as Sent</button>
                <button onClick={() => handleStatusChange("Accepted")} className="px-4 py-3 text-left text-sm hover:bg-[var(--muted)] font-medium text-green-600 border-b border-[var(--border)]">Mark as Accepted</button>
                <button onClick={() => handleStatusChange("Declined")} className="px-4 py-3 text-left text-sm hover:bg-[var(--muted)] font-medium text-red-600">Mark as Declined</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* The Printable Document */}
      <div className="bg-white text-black rounded-sm border border-gray-200 shadow-sm min-h-[1056px] print:shadow-none print:border-none print:m-0 print:p-0">
        <div className="p-12 md:p-16 space-y-12">
          
          {/* Document Header */}
          <div className="flex justify-between items-start border-b border-gray-200 pb-12">
            <div>
              <h2 className="text-3xl font-black tracking-tight mb-1">PROPOSAL</h2>
              <p className="text-gray-500 font-medium">Prepared for: {proposal.prospect?.name || "Client"}</p>
              {proposal.prospect?.industry && <p className="text-gray-500 font-medium">{proposal.prospect.industry}</p>}
            </div>
            <div className="text-right">
              <h1 className="text-xl font-bold tracking-tight uppercase">FIRST CLIENT AI</h1>
              <p className="text-gray-500 font-medium mt-1">{new Date(proposal.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
            </div>
          </div>

          {/* Document Body */}
          <div className="prose prose-sm md:prose-base prose-slate max-w-none prose-h2:text-xl prose-h2:font-bold prose-h2:mt-8 prose-h2:mb-4 prose-h2:pb-2 prose-h2:border-b prose-h2:border-gray-100 prose-p:leading-relaxed prose-p:text-gray-700">
            {proposal.content ? (
              <div dangerouslySetInnerHTML={{ 
                // Very basic markdown to HTML for rendering the # headers
                __html: proposal.content
                  .replace(/## (.*)/g, '<h2>$1</h2>')
                  .replace(/\n\n/g, '</p><p>')
                  .replace(/^/, '<p>')
                  .replace(/$/, '</p>')
              }} />
            ) : (
              <p className="italic text-gray-400">No content available.</p>
            )}
          </div>
          
        </div>
      </div>
    </div>
  );
}
