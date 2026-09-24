"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Sparkles, ArrowRight, CheckCircle2, MessageSquare, Copy, Send, Check } from "lucide-react";

export function OutreachClient({ 
  prospects 
}: { 
  prospects: any[]
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialProspectId = searchParams.get("prospectId") || (prospects.length > 0 ? prospects[0].id : "");
  
  const [selectedProspectId, setSelectedProspectId] = useState(initialProspectId);
  const [tone, setTone] = useState("Professional");
  
  const [loading, setLoading] = useState(false);
  const [generatedMessages, setGeneratedMessages] = useState<any[] | null>(null);
  
  const [savingMsgIndex, setSavingMsgIndex] = useState<number | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingPhase, setLoadingPhase] = useState(0);
  
  const loadingMessages = [
    "Analyzing prospect details...",
    "Finding the perfect tone...",
    "Writing personalized outreach...",
    "Preparing your options..."
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

  const handleGenerate = async () => {
    if (!selectedProspectId) return;
    setLoading(true);
    setGeneratedMessages(null);
    setSuccess(false);
    setError(null);
    
    try {
      const res = await fetch("/api/outreach/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prospectId: selectedProspectId, tone })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.messages) {
          setGeneratedMessages(data.messages);
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

  const handleCopy = (content: string, index: number) => {
    navigator.clipboard.writeText(content);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const updateMessage = (index: number, field: string, value: string) => {
    if (!generatedMessages) return;
    const newMsgs = [...generatedMessages];
    newMsgs[index] = { ...newMsgs[index], [field]: value };
    setGeneratedMessages(newMsgs);
  };

  const handleSaveMessage = async (msg: any, index: number, markAsSent: boolean) => {
    setSavingMsgIndex(index);
    try {
      const res = await fetch("/api/outreach/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prospectId: selectedProspectId,
          messageType: msg.type,
          platform: msg.platform,
          content: msg.content,
          subject: msg.subject,
          markAsSent
        })
      });
      
      if (res.ok) {
        if (markAsSent) {
          setSuccess(true);
          router.refresh();
        } else {
          alert("Outreach saved as draft in prospect history.");
          router.refresh();
        }
      }
    } catch (error) {
      console.error(error);
    }
    setSavingMsgIndex(null);
  };

  if (prospects.length === 0) {
    return (
      <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-10 shadow-sm text-center">
        <h2 className="text-2xl font-bold mb-4">No prospects found.</h2>
        <p className="text-[var(--muted-foreground)] mb-8">You need to add a prospect before you can generate outreach.</p>
        <button 
          onClick={() => router.push("/dashboard/prospects")}
          className="px-6 py-3 bg-primary text-white rounded-lg font-bold hover:bg-primary/90 transition-colors"
        >
          Go to Prospect Finder
        </button>
      </div>
    );
  }

  if (success) {
    return (
      <div className="bg-[var(--card)] border border-green-500/20 rounded-2xl p-8 text-center max-w-2xl mx-auto shadow-sm animate-in fade-in zoom-in duration-300">
        <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="w-8 h-8 text-green-500" />
        </div>
        <h2 className="text-3xl font-bold mb-4">Your first outreach is ready.</h2>
        <p className="text-[var(--muted-foreground)] mb-8 text-lg">
          The message has been marked as sent and saved to the prospect's history. Great job taking action!
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <button 
            onClick={() => router.push(`/dashboard/prospects/${selectedProspectId}`)}
            className="px-6 py-4 border border-[var(--border)] bg-[var(--card)] rounded-xl font-bold hover:bg-[var(--muted)] transition-colors"
          >
            View Prospect
          </button>
          <button 
            onClick={() => router.push("/dashboard/proposal")}
            className="px-8 py-4 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 shadow-md"
          >
            Create a Proposal <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-6 md:p-8 shadow-sm">
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div>
            <label className="block text-xs font-bold text-[var(--muted-foreground)] uppercase tracking-wider mb-2">Select Prospect</label>
            <select 
              value={selectedProspectId} 
              onChange={e => setSelectedProspectId(e.target.value)}
              className="w-full px-4 py-3 border border-[var(--border)] rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 bg-[var(--background)] font-medium text-lg"
            >
              <option value="" disabled>Select a prospect...</option>
              {prospects.map(p => (
                <option key={p.id} value={p.id}>{p.name} ({p.industry || 'No industry'})</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-[var(--muted-foreground)] uppercase tracking-wider mb-2">Outreach Tone</label>
            <select 
              value={tone} 
              onChange={e => setTone(e.target.value)}
              className="w-full px-4 py-3 border border-[var(--border)] rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 bg-[var(--background)] font-medium text-lg"
            >
              <option value="Professional">Professional (Respectful & Formal)</option>
              <option value="Friendly">Friendly (Warm & Enthusiastic)</option>
              <option value="Casual">Casual (Relaxed & Conversational)</option>
              <option value="Direct">Direct (To the point)</option>
            </select>
          </div>
        </div>

        {selectedProspect && (
          <div className="bg-[var(--muted)]/30 p-5 rounded-xl border border-[var(--border)] mb-8">
            <h3 className="font-bold mb-2 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-primary" /> Context for AI
            </h3>
            <p className="text-sm text-[var(--muted-foreground)] mb-4">The AI will use the prospect's observed problem to personalize the message naturally.</p>
            <div className="text-sm">
              <span className="font-bold text-[var(--foreground)]">Observed Problem:</span> {selectedProspect.observedProblem || "None recorded. (Will use a generic problem based on platform/niche)."}
            </div>
          </div>
        )}

        <button
          onClick={handleGenerate}
          disabled={loading || !selectedProspectId}
          className="w-full py-4 px-6 bg-[var(--foreground)] text-[var(--background)] rounded-xl font-bold hover:bg-[var(--foreground)]/90 transition-all disabled:opacity-50 flex items-center justify-center gap-2 text-lg shadow-md"
        >
          {loading ? (
            <span className="animate-pulse">{loadingMessages[loadingPhase]}</span>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              Generate Outreach Options
            </>
          )}
        </button>
        
        {error === "LIMIT_REACHED" ? (
          <div className="mt-6 p-6 bg-orange-500/10 border border-orange-500/20 text-orange-700 rounded-xl max-w-md w-full mx-auto text-center">
            <h3 className="font-bold text-lg mb-2">You're out of generations for this tool this month.</h3>
            <button onClick={() => router.push("/pricing")} className="mt-3 px-6 py-2 bg-orange-500 text-white font-bold rounded-lg hover:bg-orange-600 transition-colors">
              Upgrade to Pro
            </button>
          </div>
        ) : error && (
          <div className="mt-6 p-4 bg-red-500/10 border border-red-500/20 text-red-600 rounded-xl max-w-md w-full mx-auto text-center">
            <p className="font-medium text-sm">{error}</p>
          </div>
        )}
      </div>

      {generatedMessages && (
        <div className="space-y-12 animate-in fade-in duration-500">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold mb-2">Your Outreach Messages</h2>
            <p className="text-[var(--muted-foreground)]">
              Choose the format that best fits how you want to contact them. Review and edit the message before sending, then click "Mark as Sent" to log it in your pipeline.
            </p>
          </div>

          <div className="space-y-8">
            {generatedMessages.map((msg, index) => (
              <div key={index} className="bg-[var(--card)] border border-[var(--border)] rounded-2xl overflow-hidden shadow-sm">
                <div className="bg-[var(--muted)]/50 p-4 border-b border-[var(--border)] flex justify-between items-center">
                  <h3 className="font-bold text-lg flex items-center gap-2">
                    {msg.type}
                    <span className="bg-[var(--background)] border border-[var(--border)] text-[var(--muted-foreground)] text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider">
                      {msg.platform}
                    </span>
                  </h3>
                </div>
                
                <div className="p-6">
                  {msg.subject !== null && (
                    <div className="mb-4">
                      <label className="block text-xs font-bold text-[var(--muted-foreground)] uppercase tracking-wider mb-1">Subject Line</label>
                      <input 
                        type="text" 
                        value={msg.subject} 
                        onChange={(e) => updateMessage(index, "subject", e.target.value)}
                        className="w-full px-3 py-2 border border-[var(--border)] rounded-lg font-bold focus:outline-none focus:ring-2 focus:ring-primary/50 bg-[var(--background)]"
                      />
                    </div>
                  )}
                  
                  <div>
                    <label className="block text-xs font-bold text-[var(--muted-foreground)] uppercase tracking-wider mb-1">Message Body</label>
                    <textarea 
                      value={msg.content} 
                      onChange={(e) => updateMessage(index, "content", e.target.value)}
                      className="w-full px-4 py-3 border border-[var(--border)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 bg-[var(--background)] min-h-[200px] leading-relaxed resize-y"
                    />
                  </div>
                </div>

                <div className="bg-[var(--muted)]/20 p-4 border-t border-[var(--border)] flex flex-wrap gap-3 justify-end items-center">
                  <button 
                    onClick={() => handleCopy(msg.content, index)}
                    className="px-4 py-2 text-sm font-bold text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--muted)] rounded-lg transition-colors flex items-center gap-2"
                  >
                    {copiedIndex === index ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                    {copiedIndex === index ? "Copied!" : "Copy"}
                  </button>
                  <button 
                    onClick={() => handleSaveMessage(msg, index, false)}
                    disabled={savingMsgIndex === index}
                    className="px-4 py-2 border border-[var(--border)] bg-[var(--card)] text-sm font-bold rounded-lg hover:bg-[var(--muted)] transition-colors"
                  >
                    Save Draft
                  </button>
                  <button 
                    onClick={() => handleSaveMessage(msg, index, true)}
                    disabled={savingMsgIndex === index}
                    className="px-5 py-2 bg-primary text-white text-sm font-bold rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2 shadow-sm"
                  >
                    <Send className="w-4 h-4" /> 
                    {savingMsgIndex === index ? "Saving..." : "Mark as Sent"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
