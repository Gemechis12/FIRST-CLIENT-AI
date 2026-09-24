"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, ArrowRight, CheckCircle2, Edit2, Save, X } from "lucide-react";

export function OfferBuilderClient({ 
  existingOffer, 
  userContext 
}: { 
  existingOffer: any | null,
  userContext: { skill: string, service: string, niche: string }
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // States
  const [isEditing, setIsEditing] = useState(false);

  const safeParse = (str: string | null | undefined, fallback: any) => {
    if (!str) return fallback;
    try {
      return JSON.parse(str);
    } catch (e) {
      return str;
    }
  };

  const [offer, setOffer] = useState<any | null>(() => {
    if (existingOffer) {
      return {
        title: existingOffer.headline,
        targetCustomer: existingOffer.targetCustomer,
        problem: existingOffer.problem,
        solution: existingOffer.solution,
        deliverables: safeParse(existingOffer.deliverables, []),
        timeline: existingOffer.timeline,
        revisionPolicy: existingOffer.revisionPolicy,
        packages: safeParse(existingOffer.packagesData, [])
      };
    }
    return null;
  });

  const handleGenerate = async () => {
    setLoading(true);
    setSuccess(false);
    setError(null);
    try {
      const res = await fetch("/api/offers/generate", { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        if (data.offer) {
          const newOffer = data.offer;
          if (newOffer.headline && !newOffer.title) newOffer.title = newOffer.headline;
          setOffer(newOffer);
          setIsEditing(true);
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

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/offers/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(offer),
      });
      if (res.ok) {
        setIsEditing(false);
        setSuccess(true);
        router.refresh();
      }
    } catch (error) {
      console.error(error);
    }
    setSaving(false);
  };

  const updateField = (field: string, value: any) => {
    setOffer((prev: any) => ({ ...prev, [field]: value }));
  };

  const updatePackage = (index: number, field: string, value: any) => {
    setOffer((prev: any) => {
      const newPackages = [...prev.packages];
      newPackages[index] = { ...newPackages[index], [field]: value };
      return { ...prev, packages: newPackages };
    });
  };

  if (success) {
    return (
      <div className="bg-[var(--card)] border border-green-500/20 rounded-2xl p-8 text-center max-w-2xl mx-auto shadow-sm animate-in fade-in zoom-in duration-300">
        <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="w-8 h-8 text-green-500" />
        </div>
        <h2 className="text-3xl font-bold mb-4">Your offer is ready.</h2>
        <p className="text-[var(--muted-foreground)] mb-8 text-lg">
          You've successfully saved your freelance offer. Next step: Build a realistic portfolio.
        </p>
        <button 
          onClick={() => router.push("/dashboard/portfolio")}
          className="px-8 py-4 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 mx-auto text-lg shadow-md hover:shadow-lg hover:scale-105"
        >
          Build Your Portfolio <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-10 max-w-4xl mx-auto">
      {/* Top Context Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-[var(--card)] border border-[var(--border)] p-4 rounded-xl shadow-sm text-center">
          <p className="text-xs font-bold text-[var(--muted-foreground)] uppercase tracking-wider mb-1">Your Skill</p>
          <p className="font-bold text-primary truncate">{userContext.skill}</p>
        </div>
        <div className="bg-[var(--card)] border border-[var(--border)] p-4 rounded-xl shadow-sm text-center">
          <p className="text-xs font-bold text-[var(--muted-foreground)] uppercase tracking-wider mb-1">Your Service</p>
          <p className="font-bold text-primary truncate">{userContext.service}</p>
        </div>
        <div className="bg-[var(--card)] border border-[var(--border)] p-4 rounded-xl shadow-sm text-center">
          <p className="text-xs font-bold text-[var(--muted-foreground)] uppercase tracking-wider mb-1">Your Niche</p>
          <p className="font-bold text-primary truncate">{userContext.niche}</p>
        </div>
      </div>

      {!offer && !loading && (
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-10 shadow-sm flex flex-col items-center text-center">
          <h2 className="text-2xl font-bold mb-4">Ready to build your offer?</h2>
          <p className="text-[var(--muted-foreground)] mb-8 max-w-md">
            We will generate a structured, professional offer that speaks directly to your niche's problems and provides clear deliverables.
          </p>
          <button
            onClick={handleGenerate}
            disabled={loading || saving}
            className="w-full max-w-md py-4 px-6 bg-[var(--foreground)] text-[var(--background)] rounded-xl font-bold hover:bg-[var(--foreground)]/90 transition-all flex items-center justify-center gap-2 text-lg shadow-md disabled:opacity-50"
          >
            <Sparkles className="w-5 h-5" />
            Build My Offer
          </button>
          
          {error === "LIMIT_REACHED" ? (
            <div className="mt-6 p-6 bg-orange-500/10 border border-orange-500/20 text-orange-700 rounded-xl max-w-md w-full flex flex-col items-center text-center">
              <h3 className="font-bold text-lg mb-2">You're out of generations for this tool this month.</h3>
              <button onClick={() => router.push("/pricing")} className="mt-3 px-6 py-2 bg-orange-500 text-white font-bold rounded-lg hover:bg-orange-600 transition-colors">
                Upgrade to Pro
              </button>
            </div>
          ) : error && (
            <div className="mt-6 p-4 bg-red-500/10 border border-red-500/20 text-red-600 rounded-xl max-w-md w-full text-center">
              <p className="font-medium text-sm">{error}</p>
            </div>
          )}
        </div>
      )}

      {loading && (
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-10 shadow-sm flex flex-col items-center text-center animate-pulse">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
          <h2 className="text-xl font-bold">Building your offer...</h2>
          <p className="text-[var(--muted-foreground)] mt-2">Analyzing your skill, service, and niche to build the perfect package.</p>
        </div>
      )}

      {offer && (
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
          
          <div className="p-4 md:p-6 border-b border-[var(--border)] bg-[var(--muted)]/30 flex justify-between items-center sticky top-0 z-10 backdrop-blur-md">
            <h2 className="text-xl font-bold">
              {existingOffer && !isEditing ? "Your Current Offer" : "Offer Details"}
            </h2>
            <div className="flex gap-2">
              {!isEditing ? (
                <>
                  <button 
                    onClick={handleGenerate} 
                    className="px-4 py-2 border border-[var(--border)] bg-[var(--card)] rounded-lg text-sm font-medium hover:bg-[var(--muted)] transition-colors hidden sm:block"
                  >
                    Create New Version
                  </button>
                  <button 
                    onClick={() => setIsEditing(true)} 
                    className="px-4 py-2 bg-[var(--foreground)] text-[var(--background)] rounded-lg text-sm font-medium hover:bg-[var(--foreground)]/90 transition-colors flex items-center gap-2"
                  >
                    <Edit2 className="w-4 h-4" /> Edit Offer
                  </button>
                </>
              ) : (
                <>
                  <button 
                    onClick={() => setIsEditing(false)} 
                    className="px-4 py-2 border border-[var(--border)] bg-[var(--card)] rounded-lg text-sm font-medium hover:bg-[var(--muted)] transition-colors flex items-center gap-2"
                  >
                    <X className="w-4 h-4" /> Cancel
                  </button>
                  <button 
                    onClick={handleSave} 
                    disabled={saving}
                    className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-bold hover:bg-primary/90 transition-colors flex items-center gap-2"
                  >
                    {saving ? "Saving..." : <><Save className="w-4 h-4" /> Save Changes</>}
                  </button>
                </>
              )}
            </div>
          </div>

          <div className="p-6 md:p-8 space-y-8">
            
            {/* Title */}
            <div>
              <label className="block text-xs font-bold text-[var(--muted-foreground)] uppercase tracking-wider mb-2">Offer Title</label>
              {isEditing ? (
                <input 
                  type="text" 
                  value={offer.title} 
                  onChange={(e) => updateField("title", e.target.value)}
                  className="w-full px-4 py-3 text-xl font-bold border border-[var(--border)] rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 bg-[var(--background)]"
                />
              ) : (
                <h3 className="text-3xl font-bold">{offer.title}</h3>
              )}
            </div>

            {/* Core Info Grid */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-[var(--muted)]/20 p-5 rounded-xl border border-[var(--border)]">
                <label className="block text-xs font-bold text-primary uppercase tracking-wider mb-2">Target Customer</label>
                {isEditing ? (
                  <textarea 
                    value={offer.targetCustomer} 
                    onChange={(e) => updateField("targetCustomer", e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-[var(--border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 bg-[var(--background)] min-h-[80px]"
                  />
                ) : (
                  <p className="text-[var(--foreground)]">{offer.targetCustomer}</p>
                )}
              </div>
              <div className="bg-[var(--muted)]/20 p-5 rounded-xl border border-[var(--border)]">
                <label className="block text-xs font-bold text-red-500 uppercase tracking-wider mb-2">The Problem</label>
                {isEditing ? (
                  <textarea 
                    value={offer.problem} 
                    onChange={(e) => updateField("problem", e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-[var(--border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 bg-[var(--background)] min-h-[80px]"
                  />
                ) : (
                  <p className="text-[var(--foreground)]">{offer.problem}</p>
                )}
              </div>
            </div>

            <div className="bg-primary/5 p-6 rounded-xl border border-primary/20">
              <label className="block text-xs font-bold text-primary uppercase tracking-wider mb-2">The Solution</label>
              {isEditing ? (
                <textarea 
                  value={offer.solution} 
                  onChange={(e) => updateField("solution", e.target.value)}
                  className="w-full px-3 py-2 text-lg border border-[var(--border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 bg-[var(--background)] min-h-[80px]"
                />
              ) : (
                <p className="text-lg font-medium">{offer.solution}</p>
              )}
            </div>

            {/* Deliverables & Timeline */}
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-[var(--muted-foreground)] uppercase tracking-wider mb-3">Deliverables</label>
                {isEditing ? (
                  <textarea 
                    value={Array.isArray(offer.deliverables) ? offer.deliverables.join("\n") : (offer.deliverables || "")} 
                    onChange={(e) => updateField("deliverables", e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-[var(--border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 bg-[var(--background)] min-h-[150px]"
                    placeholder="Describe your deliverables..."
                  />
                ) : (
                  <ul className="space-y-2">
                    {Array.isArray(offer.deliverables) ? offer.deliverables.map((item: string, i: number) => (
                      <li key={i} className="flex items-start gap-2">
                        <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
                        <span>{item}</span>
                      </li>
                    )) : offer.deliverables?.split('\n').map((item: string, i: number) => item.trim() ? (
                      <li key={i} className="flex items-start gap-2">
                        <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
                        <span>{item.replace(/^[•\-\*]\s*/, '')}</span>
                      </li>
                    ) : null)}
                  </ul>
                )}
              </div>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-bold text-[var(--muted-foreground)] uppercase tracking-wider mb-2">Timeline</label>
                  {isEditing ? (
                    <input 
                      type="text" 
                      value={offer.timeline} 
                      onChange={(e) => updateField("timeline", e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-[var(--border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 bg-[var(--background)]"
                    />
                  ) : (
                    <p className="font-bold">{offer.timeline}</p>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-bold text-[var(--muted-foreground)] uppercase tracking-wider mb-2">Revision Policy</label>
                  {isEditing ? (
                    <input 
                      type="text" 
                      value={offer.revisionPolicy} 
                      onChange={(e) => updateField("revisionPolicy", e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-[var(--border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 bg-[var(--background)]"
                    />
                  ) : (
                    <p className="font-bold">{offer.revisionPolicy}</p>
                  )}
                </div>
              </div>
            </div>

            <hr className="border-[var(--border)]" />

            {/* Packages */}
            <div>
              <div className="mb-6">
                <h3 className="text-xl font-bold">Packages</h3>
                <p className="text-sm text-[var(--muted-foreground)] flex items-center gap-1 mt-1">
                  <span className="text-yellow-600 bg-yellow-500/10 px-2 py-0.5 rounded text-xs font-bold mr-2">IMPORTANT</span>
                  Prices are suggested starting rates — adjust based on your market and scope.
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                {offer.packages.map((pkg: any, index: number) => (
                  <div key={index} className={`rounded-xl border ${index === 1 ? 'border-primary ring-1 ring-primary shadow-md relative' : 'border-[var(--border)] shadow-sm'} p-6 bg-[var(--background)] flex flex-col`}>
                    {index === 1 && (
                      <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-primary text-white text-xs font-bold px-3 py-1 rounded-full">
                        MOST POPULAR
                      </div>
                    )}
                    
                    {isEditing ? (
                      <div className="space-y-3 mb-4">
                        <input 
                          type="text" 
                          value={pkg.name} 
                          onChange={(e) => updatePackage(index, "name", e.target.value)}
                          className="w-full px-2 py-1 font-bold text-xl border border-[var(--border)] rounded focus:outline-none focus:ring-2 focus:ring-primary/50"
                        />
                        <textarea 
                          value={pkg.description} 
                          onChange={(e) => updatePackage(index, "description", e.target.value)}
                          className="w-full px-2 py-1 text-sm text-[var(--muted-foreground)] border border-[var(--border)] rounded focus:outline-none focus:ring-2 focus:ring-primary/50"
                        />
                      </div>
                    ) : (
                      <div className="mb-6">
                        <h4 className="text-xl font-bold mb-2">{pkg.name}</h4>
                        <p className="text-sm text-[var(--muted-foreground)] min-h-[40px]">{pkg.description}</p>
                      </div>
                    )}
                    
                    <div className="flex-1">
                      <p className="text-xs font-bold text-[var(--muted-foreground)] uppercase tracking-wider mb-3">Includes:</p>
                      {isEditing ? (
                        <textarea 
                          value={Array.isArray(pkg.deliverables) ? pkg.deliverables.join("\n") : (pkg.deliverables || pkg.description || "")} 
                          onChange={(e) => updatePackage(index, "deliverables", e.target.value.split("\n"))}
                          className="w-full px-2 py-1 text-sm border border-[var(--border)] rounded focus:outline-none focus:ring-2 focus:ring-primary/50 min-h-[120px] mb-4"
                          placeholder="What is included?"
                        />
                      ) : (
                        <ul className="space-y-2 mb-6 text-sm">
                          {Array.isArray(pkg.deliverables) ? pkg.deliverables.map((item: string, i: number) => (
                            <li key={i} className="flex items-start gap-2">
                              <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                              <span>{item}</span>
                            </li>
                          )) : (pkg.deliverables || pkg.description)?.split('\n').map((item: string, i: number) => item.trim() ? (
                            <li key={i} className="flex items-start gap-2">
                              <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                              <span>{item.replace(/^[•\-\*]\s*/, '')}</span>
                            </li>
                          ) : null)}
                        </ul>
                      )}
                    </div>
                    
                    <div className="pt-4 border-t border-[var(--border)] mt-auto">
                      {isEditing ? (
                        <div className="space-y-2">
                          <div>
                            <label className="text-xs text-[var(--muted-foreground)]">Price</label>
                            <input 
                              type="text" 
                              value={pkg.suggestedPrice || pkg.price || ""} 
                              onChange={(e) => updatePackage(index, "price", e.target.value)}
                              className="w-full px-2 py-1 font-bold text-xl border border-[var(--border)] rounded focus:outline-none focus:ring-2 focus:ring-primary/50"
                            />
                          </div>
                          <div>
                            <label className="text-xs text-[var(--muted-foreground)]">Timeline</label>
                            <input 
                              type="text" 
                              value={pkg.timeline || ""} 
                              onChange={(e) => updatePackage(index, "timeline", e.target.value)}
                              className="w-full px-2 py-1 text-sm border border-[var(--border)] rounded focus:outline-none focus:ring-2 focus:ring-primary/50"
                            />
                          </div>
                        </div>
                      ) : (
                        <div className="text-center">
                          <p className="text-3xl font-bold mb-1">{pkg.suggestedPrice || pkg.price || "TBD"}</p>
                          <p className="text-xs text-[var(--muted-foreground)] uppercase tracking-wider">{pkg.timeline || ""}</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom Save Action */}
            {isEditing && (
              <div className="pt-6 mt-6 flex justify-end">
                <button 
                  onClick={handleSave} 
                  disabled={saving}
                  className="px-8 py-4 bg-primary text-white rounded-xl text-lg font-bold hover:bg-primary/90 transition-colors flex items-center gap-2 shadow-md"
                >
                  {saving ? "Saving Offer..." : "Save My Offer"}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
