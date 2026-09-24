"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, ArrowRight, Briefcase, CheckCircle2 } from "lucide-react";

export function ServiceFinderClient({ initialSkill }: { initialSkill: string }) {
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
      const res = await fetch("/api/services/generate", { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        if (data.services) {
          setResults(data.services);
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

  const handleSaveService = async (service: any) => {
    setSaving(true);
    try {
      const res = await fetch("/api/services/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(service),
      });
      if (res.ok) {
        setSuccess(true);
        router.refresh(); // to update sidebar layout state
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
        <h2 className="text-3xl font-bold mb-4">Your service is ready.</h2>
        <p className="text-[var(--muted-foreground)] mb-8 text-lg">
          We've successfully saved your new freelance service to your profile.
        </p>
        <button 
          onClick={() => router.push("/dashboard/niche")}
          className="px-8 py-4 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 mx-auto text-lg shadow-md hover:shadow-lg hover:scale-105"
        >
          Find My Niche <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-8 shadow-sm flex flex-col items-center text-center">
        <div className="mb-6">
          <p className="text-sm font-semibold text-[var(--muted-foreground)] uppercase tracking-wider mb-2">Your Skill</p>
          <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-6 py-2 text-xl font-bold text-primary">
            {initialSkill}
          </div>
        </div>
        <button
          onClick={handleGenerate}
          disabled={loading || saving}
          className="w-full max-w-md py-4 px-6 bg-[var(--foreground)] text-[var(--background)] rounded-xl font-bold hover:bg-[var(--foreground)]/90 transition-all disabled:opacity-50 flex items-center justify-center gap-2 text-lg shadow-md"
        >
          {loading ? (
            <span className="animate-pulse">Finding services that match your skills...</span>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              Generate Services
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
            <Briefcase className="w-6 h-6 text-primary" />
            Recommended Services for "{initialSkill}"
          </h2>
          
          <div className="grid gap-6">
            {results.map((service, index) => (
              <div key={index} className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-6 md:p-8 hover:shadow-lg transition-all hover:-translate-y-1 relative overflow-hidden">
                <div className="flex flex-col md:flex-row justify-between items-start mb-4 gap-4">
                  <h3 className="text-2xl font-bold">{service.title}</h3>
                  {service.isBeginnerFriendly && (
                    <span className="bg-green-500/10 text-green-600 border border-green-500/20 text-xs px-3 py-1.5 rounded-full font-bold uppercase tracking-wider shrink-0">
                      Beginner Friendly
                    </span>
                  )}
                </div>
                
                <p className="text-[var(--foreground)] mb-8 text-lg leading-relaxed">{service.description}</p>
                
                <div className="grid md:grid-cols-2 gap-4 mb-8">
                  <div className="bg-[var(--muted)]/50 p-4 rounded-xl">
                    <p className="text-xs font-bold text-[var(--muted-foreground)] mb-1 uppercase tracking-wider">Target Clients</p>
                    <p className="font-medium">{service.targetClients}</p>
                  </div>
                  <div className="bg-[var(--muted)]/50 p-4 rounded-xl">
                    <p className="text-xs font-bold text-[var(--muted-foreground)] mb-1 uppercase tracking-wider">Problem Solved</p>
                    <p className="font-medium">{service.problemsSolved}</p>
                  </div>
                  <div className="bg-[var(--muted)]/50 p-4 rounded-xl md:col-span-2">
                    <p className="text-xs font-bold text-[var(--muted-foreground)] mb-1 uppercase tracking-wider">Example Deliverables</p>
                    <p className="font-medium">{service.deliverables}</p>
                  </div>
                </div>
                
                <button 
                  onClick={() => handleSaveService(service)}
                  disabled={saving}
                  className="w-full py-4 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 text-lg shadow-sm"
                >
                  {saving ? "Saving..." : "Choose This Service"}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
