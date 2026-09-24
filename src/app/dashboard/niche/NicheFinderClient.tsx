"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, ArrowRight, Target, CheckCircle2 } from "lucide-react";

export function NicheFinderClient({ serviceTitle }: { serviceTitle: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [results, setResults] = useState<any[] | null>(null);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    setLoading(true);
    setResults(null);
    setSuccess(false);
    setError(null);
    try {
      const res = await fetch("/api/niches/generate", { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        if (data.niches) {
          setResults(data.niches);
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

  const handleSaveNiche = async (niche: any) => {
    setSaving(true);
    try {
      const res = await fetch("/api/niches/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(niche),
      });
      if (res.ok) {
        setSuccess(true);
        router.refresh();
      } else {
        setError("Failed to save. Please try again.");
      }
    } catch (err) {
      setError("Failed to save. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (success) {
    return (
      <div className="bg-[var(--card)] border border-green-500/20 rounded-2xl p-8 text-center max-w-2xl mx-auto shadow-sm animate-in fade-in zoom-in duration-300">
        <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="w-8 h-8 text-green-500" />
        </div>
        <h2 className="text-3xl font-bold mb-4">Your niche is ready.</h2>
        <p className="text-[var(--muted-foreground)] mb-8 text-lg">
          We've successfully saved your target audience to your profile.
        </p>
        <button 
          onClick={() => router.push("/dashboard/offer")}
          className="px-8 py-4 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 mx-auto text-lg shadow-md hover:shadow-lg hover:scale-105"
        >
          Build My Offer <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-8 shadow-sm flex flex-col items-center text-center">
        <div className="mb-6">
          <p className="text-sm font-semibold text-[var(--muted-foreground)] uppercase tracking-wider mb-2">Your Service</p>
          <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-6 py-2 text-xl font-bold text-primary">
            {serviceTitle}
          </div>
        </div>
        <h2 className="text-2xl font-bold mb-6">Who should you sell it to?</h2>
        <button
          onClick={handleGenerate}
          disabled={loading || saving}
          className="w-full max-w-md py-4 px-6 bg-[var(--foreground)] text-[var(--background)] rounded-xl font-bold hover:bg-[var(--foreground)]/90 transition-all disabled:opacity-50 flex items-center justify-center gap-2 text-lg shadow-md"
        >
          {loading ? (
            <span className="animate-pulse">Finding potential niches...</span>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              Find My Niches
            </>
          )}
        </button>

        {error === "LIMIT_REACHED" ? (
          <div className="mt-6 p-6 bg-orange-500/10 border border-orange-500/20 text-orange-700 rounded-xl max-w-md w-full flex flex-col items-center text-center">
            <h3 className="font-bold text-lg mb-2">You're out of generations for this tool this month.</h3>
            <button onClick={() => router.push("/pricing")} className="mt-3 px-6 py-2 bg-orange-500 text-white font-bold rounded-lg hover:bg-orange-600 transition-colors">
              Upgrade to Pro
            </button>
          </div>
        ) : error && (
          <div className="mt-6 p-4 bg-red-500/10 border border-red-500/20 text-red-600 rounded-xl max-w-md w-full">
            <p className="font-medium text-sm">{error}</p>
          </div>
        )}
      </div>

      {results && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <h2 className="text-2xl font-bold flex items-center gap-2 mb-6">
            <Target className="w-6 h-6 text-primary" />
            Recommended Niches
          </h2>
          
          <div className="grid gap-6 md:grid-cols-2">
            {results.map((niche, index) => (
              <div key={index} className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-6 md:p-8 hover:shadow-lg transition-all hover:-translate-y-1 flex flex-col h-full">
                <h3 className="text-2xl font-bold mb-6">{niche.name}</h3>
                
                <div className="space-y-4 flex-1 mb-8">
                  <div>
                    <p className="text-xs font-bold text-[var(--muted-foreground)] mb-1 uppercase tracking-wider">Why they need it</p>
                    <p className="font-medium text-lg">{niche.whyTheyNeed}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[var(--muted-foreground)] mb-1 uppercase tracking-wider">Common problems</p>
                    <p className="font-medium">{niche.commonProblems}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[var(--muted-foreground)] mb-1 uppercase tracking-wider">Potential clients</p>
                    <p className="font-medium">{niche.exampleClients}</p>
                  </div>
                  <div className="bg-primary/5 p-4 rounded-xl border border-primary/20 mt-4">
                    <p className="text-xs font-bold text-primary mb-1 uppercase tracking-wider">Opportunity</p>
                    <p className="font-bold text-primary">{niche.opportunity}</p>
                  </div>
                </div>
                
                <button 
                  onClick={() => handleSaveNiche(niche)}
                  disabled={saving}
                  className="w-full py-4 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 text-lg shadow-sm"
                >
                  {saving ? "Saving..." : "Choose This Niche"}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
