"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Sparkles, ArrowRight, CheckCircle2, FileText, Send, Copy, RefreshCw, X } from "lucide-react";

export function ProposalClient({ 
  prospects,
  offers
}: { 
  prospects: any[],
  offers: any[]
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialProspectId = searchParams.get("prospectId") || (prospects.length > 0 ? prospects[0].id : "");
  
  const [selectedProspectId, setSelectedProspectId] = useState(initialProspectId);
  const [selectedOfferId, setSelectedOfferId] = useState(offers.length > 0 ? offers[0].id : "");
  
  const [projectDetails, setProjectDetails] = useState({
    title: "",
    clientRequirements: "",
    deliverables: "",
    timeline: "",
    revisions: "",
    price: "",
    paymentTerms: ""
  });
  
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  
  const [generatedProposal, setGeneratedProposal] = useState<any | null>(null);
  
  const [successState, setSuccessState] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingPhase, setLoadingPhase] = useState(0);
  const [copied, setCopied] = useState(false);
  
  const loadingMessages = [
    "Analyzing the prospect...",
    "Reviewing your offer and deliverables...",
    "Structuring the proposal...",
    "Writing a persuasive pitch..."
  ];
  
  useEffect(() => {
    if (!loading) {
      setLoadingPhase(0);
      return;
    }
    const interval = setInterval(() => {
      setLoadingPhase(prev => Math.min(prev + 1, loadingMessages.length - 1));
    }, 2500);
    return () => clearInterval(interval);
  }, [loading]);

  const selectedProspect = prospects.find(p => p.id === selectedProspectId);
  const selectedOffer = offers.find(o => o.id === selectedOfferId);

  const handleGenerate = async () => {
    if (!selectedProspectId || !selectedOfferId) return;
    setLoading(true);
    setSuccessState(false);
    setError(null);
    
    try {
      const res = await fetch("/api/proposal/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          prospectId: selectedProspectId, 
          offerId: selectedOfferId,
          projectDetails
        })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.proposal) {
          setGeneratedProposal(data.proposal);
        } else {
          setError("Something went wrong while generating this. Please try again.");
        }
      } else {
        const data = await res.json().catch(() => ({}));
        if (data.error === "LIMIT_REACHED") {
          setError("LIMIT_REACHED");
        } else {
          setError("Something went wrong while generating this. Please try again.");
        }
      }
    } catch (err) {
      setError("Something went wrong while generating this. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (status: string) => {
    if (!generatedProposal) return;
    setSaving(true);
    
    try {
      const res = await fetch("/api/proposal/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prospectId: selectedProspectId,
          offerId: selectedOfferId,
          title: generatedProposal.title,
          content: generatedProposal.content,
          price: projectDetails.price,
          paymentTerms: projectDetails.paymentTerms,
          status
        })
      });
      
      if (res.ok) {
        if (status === "Sent") {
          setSuccessState(true);
          router.refresh();
        } else {
          alert("Proposal saved as Draft.");
          router.push("/dashboard"); // or to proposal library later
        }
      } else {
        const data = await res.json().catch(() => ({}));
        if (data.error === "LIMIT_REACHED") {
          setError("LIMIT_REACHED");
        }
      }
    } catch (error) {
      console.error(error);
    }
    setSaving(false);
  };

  const handleCopy = () => {
    if (!generatedProposal) return;
    navigator.clipboard.writeText(generatedProposal.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (prospects.length === 0) {
    return (
      <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-10 shadow-sm text-center">
        <div className="w-16 h-16 bg-[var(--muted)] rounded-full flex items-center justify-center mx-auto mb-4">
          <FileText className="w-8 h-8 text-[var(--muted-foreground)]" />
        </div>
        <h2 className="text-2xl font-bold mb-4">No prospects found.</h2>
        <p className="text-[var(--muted-foreground)] mb-8">You need to have an interested prospect before creating a proposal.</p>
        <button 
          onClick={() => router.push("/dashboard/prospects")}
          className="px-6 py-3 bg-primary text-white rounded-lg font-bold hover:bg-primary/90 transition-colors"
        >
          Add Your First Prospect
        </button>
      </div>
    );
  }

  if (successState) {
    return (
      <div className="bg-[var(--card)] border border-green-500/20 rounded-2xl p-8 text-center max-w-2xl mx-auto shadow-sm animate-in fade-in zoom-in duration-300">
        <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="w-8 h-8 text-green-500" />
        </div>
        <h2 className="text-3xl font-bold mb-4">Your proposal is ready.</h2>
        <p className="text-[var(--muted-foreground)] mb-8 text-lg">
          It has been saved and your prospect's pipeline status has been updated to "Proposal Sent". 
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <button 
            onClick={() => router.push(`/dashboard/prospects/${selectedProspectId}`)}
            className="px-6 py-4 border border-[var(--border)] bg-[var(--card)] rounded-xl font-bold hover:bg-[var(--muted)] transition-colors"
          >
            Track Your Client
          </button>
          <button 
            onClick={() => router.push("/dashboard")}
            className="px-8 py-4 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-colors shadow-md"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      
      {!generatedProposal ? (
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-6 md:p-8 shadow-sm space-y-8 animate-in fade-in duration-500">
          
          <div className="grid md:grid-cols-2 gap-8">
            {/* Prospect Selection */}
            <div className="space-y-4">
              <h2 className="text-xl font-bold border-b border-[var(--border)] pb-2">1. Who is this proposal for?</h2>
              <div>
                <label className="block text-xs font-bold text-[var(--muted-foreground)] uppercase tracking-wider mb-2">Select Prospect</label>
                <select 
                  value={selectedProspectId} 
                  onChange={e => setSelectedProspectId(e.target.value)}
                  className="w-full px-4 py-3 border border-[var(--border)] rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 bg-[var(--background)] font-medium text-lg"
                >
                  {prospects.map(p => (
                    <option key={p.id} value={p.id}>{p.name} ({p.status})</option>
                  ))}
                </select>
              </div>

              {selectedProspect && (
                <div className="bg-[var(--muted)]/30 p-4 rounded-xl border border-[var(--border)] text-sm">
                  <p className="font-bold mb-1">Context:</p>
                  <p className="text-[var(--muted-foreground)] line-clamp-2">{selectedProspect.observedProblem || selectedProspect.notes || "No context notes saved."}</p>
                </div>
              )}
            </div>

            {/* Offer Selection */}
            <div className="space-y-4">
              <h2 className="text-xl font-bold border-b border-[var(--border)] pb-2">2. What are you offering?</h2>
              <div>
                <label className="block text-xs font-bold text-[var(--muted-foreground)] uppercase tracking-wider mb-2">Select Offer</label>
                <select 
                  value={selectedOfferId} 
                  onChange={e => setSelectedOfferId(e.target.value)}
                  className="w-full px-4 py-3 border border-[var(--border)] rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 bg-[var(--background)] font-medium text-lg"
                >
                  {offers.map(o => (
                    <option key={o.id} value={o.id}>{o.headline}</option>
                  ))}
                </select>
              </div>
              
              {selectedOffer && (
                <div className="bg-[var(--muted)]/30 p-4 rounded-xl border border-[var(--border)] text-sm">
                  <p className="font-bold mb-1">Timeline & Delivery:</p>
                  <p className="text-[var(--muted-foreground)] line-clamp-2">{selectedOffer.timeline || "Not specified"}</p>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-bold border-b border-[var(--border)] pb-2">3. Specific Project Details (Optional)</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[var(--muted-foreground)] uppercase tracking-wider mb-2">Project Title</label>
                <input 
                  type="text" 
                  value={projectDetails.title}
                  onChange={e => setProjectDetails({...projectDetails, title: e.target.value})}
                  placeholder={`e.g. Video Editing for ${selectedProspect?.name || 'Client'}`}
                  className="w-full px-4 py-3 border border-[var(--border)] rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 bg-[var(--background)]"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[var(--muted-foreground)] uppercase tracking-wider mb-2">Client Requirements / Notes</label>
                <input 
                  type="text" 
                  value={projectDetails.clientRequirements}
                  onChange={e => setProjectDetails({...projectDetails, clientRequirements: e.target.value})}
                  placeholder="e.g. Needs to be delivered by Friday"
                  className="w-full px-4 py-3 border border-[var(--border)] rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 bg-[var(--background)]"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[var(--muted-foreground)] uppercase tracking-wider mb-2">Total Price</label>
                <input 
                  type="text" 
                  value={projectDetails.price}
                  onChange={e => setProjectDetails({...projectDetails, price: e.target.value})}
                  placeholder="e.g. $1,500"
                  className="w-full px-4 py-3 border border-[var(--border)] rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 bg-[var(--background)] font-medium"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[var(--muted-foreground)] uppercase tracking-wider mb-2">Payment Terms</label>
                <input 
                  type="text" 
                  value={projectDetails.paymentTerms}
                  onChange={e => setProjectDetails({...projectDetails, paymentTerms: e.target.value})}
                  placeholder="e.g. 50% upfront, 50% on completion"
                  className="w-full px-4 py-3 border border-[var(--border)] rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 bg-[var(--background)]"
                />
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-[var(--border)]">
            <button
              onClick={handleGenerate}
              disabled={loading || !selectedProspectId || !selectedOfferId}
              className="w-full py-4 px-6 bg-[var(--foreground)] text-[var(--background)] rounded-xl font-bold hover:bg-[var(--foreground)]/90 transition-all disabled:opacity-50 flex items-center justify-center gap-2 text-lg shadow-md"
            >
              {loading ? (
                <span className="animate-pulse">{loadingMessages[loadingPhase]}</span>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  Generate Proposal
                </>
              )}
            </button>
            
            {error === "LIMIT_REACHED" ? (
              <div className="mt-6 p-6 bg-orange-500/10 border border-orange-500/20 text-orange-700 rounded-xl w-full mx-auto text-center">
                <h3 className="font-bold text-lg mb-2">You're out of generations for this tool this month.</h3>
                <button onClick={() => router.push("/pricing")} className="mt-3 px-6 py-2 bg-orange-500 text-white font-bold rounded-lg hover:bg-orange-600 transition-colors">
                  Upgrade to Pro
                </button>
              </div>
            ) : error && (
              <div className="mt-6 p-4 bg-red-500/10 border border-red-500/20 text-red-600 rounded-xl w-full text-center">
                <p className="font-medium text-sm">{error}</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl overflow-hidden shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
          
          <div className="p-4 md:p-6 border-b border-[var(--border)] bg-[var(--muted)]/30 flex justify-between items-center sticky top-0 z-10 backdrop-blur-md">
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-bold">Proposal Editor</h2>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => setGeneratedProposal(null)} 
                className="px-4 py-2 border border-[var(--border)] bg-[var(--card)] rounded-lg text-sm font-medium hover:bg-[var(--muted)] transition-colors hidden sm:flex items-center gap-2"
              >
                <X className="w-4 h-4" /> Cancel
              </button>
              <button 
                onClick={handleGenerate} 
                className="p-2 border border-[var(--border)] bg-[var(--card)] rounded-lg text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
                title="Regenerate"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
              <button 
                onClick={() => handleSave("Draft")} 
                disabled={saving}
                className="px-4 py-2 border border-[var(--border)] bg-[var(--card)] rounded-lg text-sm font-bold hover:bg-[var(--muted)] transition-colors"
              >
                Save Draft
              </button>
              <button 
                onClick={() => handleSave("Sent")} 
                disabled={saving}
                className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-bold hover:bg-primary/90 transition-colors flex items-center gap-2 shadow-sm"
              >
                <Send className="w-4 h-4" /> 
                {saving ? "Saving..." : "Mark as Sent"}
              </button>
            </div>
          </div>

          <div className="p-6 md:p-8 space-y-6">
            <div>
              <label className="block text-xs font-bold text-[var(--muted-foreground)] uppercase tracking-wider mb-2">Proposal Title</label>
              <input 
                type="text" 
                value={generatedProposal.title} 
                onChange={(e) => setGeneratedProposal({...generatedProposal, title: e.target.value})}
                className="w-full px-4 py-3 text-2xl font-bold border border-[var(--border)] rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 bg-[var(--background)]"
              />
            </div>
            
            <div>
              <div className="flex justify-between items-end mb-2">
                <label className="block text-xs font-bold text-[var(--muted-foreground)] uppercase tracking-wider">Proposal Document</label>
                <button onClick={handleCopy} className="text-xs font-bold text-primary hover:underline flex items-center gap-1">
                  {copied ? <CheckCircle2 className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />} 
                  {copied ? "Copied ✓" : "Copy Full Text"}
                </button>
              </div>
              <textarea 
                value={generatedProposal.content} 
                onChange={(e) => setGeneratedProposal({...generatedProposal, content: e.target.value})}
                className="w-full px-6 py-6 border border-[var(--border)] rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 bg-[var(--background)] min-h-[600px] leading-relaxed resize-y font-medium text-sm md:text-base"
              />
            </div>

            <div className="bg-primary/5 border border-primary/20 rounded-xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h4 className="font-bold text-lg text-primary">Ready to send?</h4>
                <p className="text-sm text-[var(--muted-foreground)]">You can copy this document and send it via email, or save it here to track it.</p>
              </div>
              <button 
                onClick={() => handleSave("Sent")} 
                disabled={saving}
                className="px-8 py-4 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-colors flex items-center gap-2 shadow-md w-full sm:w-auto justify-center"
              >
                <Send className="w-5 h-5" /> 
                Mark as Sent
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
