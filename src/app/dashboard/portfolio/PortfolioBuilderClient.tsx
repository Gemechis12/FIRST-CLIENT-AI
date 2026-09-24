"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, ArrowRight, CheckCircle2, Edit2, Save, X, Plus, Trash2, Copy, FileText, ChevronRight } from "lucide-react";

export function PortfolioBuilderClient({ 
  existingProjects, 
  userContext 
}: { 
  existingProjects: any[],
  userContext: { skill: string, service: string, niche: string, offerTitle: string }
}) {
  const router = useRouter();
  
  // View states: 'list', 'edit', 'success'
  const [viewState, setViewState] = useState<'list' | 'edit' | 'success'>(existingProjects.length > 0 ? 'list' : 'edit');
  
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  
  const [currentProject, setCurrentProject] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    setLoading(true);
    setCurrentProject(null);
    setViewState('edit');
    setError(null);
    try {
      const res = await fetch("/api/portfolio/generate", { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        if (data.project) {
          setCurrentProject(data.project);
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
    if (!currentProject) return;
    setSaving(true);
    try {
      const res = await fetch("/api/portfolio/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(currentProject),
      });
      if (res.ok) {
        setViewState('success');
        router.refresh();
      } else {
        const data = await res.json().catch(() => ({}));
        if (data.error === "LIMIT_REACHED") {
          setError("LIMIT_REACHED");
        } else {
          setError("Failed to save. Please try again.");
        }
      }
    } catch (err) {
      setError("Failed to save. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this practice project?")) return;
    
    try {
      const res = await fetch(`/api/portfolio/delete?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        router.refresh();
        if (existingProjects.length === 1) {
          setViewState('edit'); // if it was the last one, go back to builder
        }
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleEditExisting = (project: any) => {
    setCurrentProject(project);
    setViewState('edit');
  };

  const handleDuplicate = (project: any) => {
    const { id, createdAt, updatedAt, ...duplicateData } = project;
    setCurrentProject({
      ...duplicateData,
      title: `${duplicateData.title} (Copy)`
    });
    setViewState('edit');
  };

  const updateField = (field: string, value: any) => {
    setCurrentProject((prev: any) => ({ ...prev, [field]: value }));
  };

  if (viewState === 'success') {
    return (
      <div className="bg-[var(--card)] border border-green-500/20 rounded-2xl p-8 text-center max-w-2xl mx-auto shadow-sm animate-in fade-in zoom-in duration-300">
        <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="w-8 h-8 text-green-500" />
        </div>
        <h2 className="text-3xl font-bold mb-4">Your practice project is ready.</h2>
        <p className="text-[var(--muted-foreground)] mb-8 text-lg">
          You now have a realistic project to build and show to potential clients.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button 
            onClick={() => {
              setViewState('list');
              setCurrentProject(null);
            }}
            className="px-6 py-4 border border-[var(--border)] bg-[var(--card)] rounded-xl font-bold hover:bg-[var(--muted)] transition-colors flex items-center justify-center gap-2 text-lg shadow-sm"
          >
            <FileText className="w-5 h-5" /> View All Projects
          </button>
          <button 
            onClick={() => router.push("/dashboard/outreach")}
            className="px-8 py-4 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 text-lg shadow-md hover:shadow-lg hover:scale-105"
          >
            Find Prospects <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    );
  }

  if (viewState === 'list') {
    return (
      <div className="space-y-8 animate-in fade-in duration-500">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">My Portfolio Projects</h2>
          <button 
            onClick={handleGenerate}
            className="px-4 py-2 bg-[var(--foreground)] text-[var(--background)] rounded-lg text-sm font-bold hover:bg-[var(--foreground)]/90 transition-all flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Create New
          </button>
        </div>

        <div className="grid gap-6">
          {existingProjects.map((project) => (
            <div key={project.id} className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-6 shadow-sm flex flex-col md:flex-row gap-6 justify-between items-start md:items-center hover:shadow-md transition-shadow">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-xl font-bold">{project.title}</h3>
                  {project.isPracticeProject && (
                    <span className="bg-blue-500/10 text-blue-600 border border-blue-500/20 text-xs px-2.5 py-1 rounded-full font-bold uppercase tracking-wider">
                      Practice Project
                    </span>
                  )}
                </div>
                <p className="text-[var(--muted-foreground)] mb-4">
                  Client: <span className="font-medium text-[var(--foreground)]">{project.practiceClient}</span> • Industry: <span className="font-medium text-[var(--foreground)]">{project.industry}</span>
                </p>
                <p className="text-sm line-clamp-2 max-w-2xl">{project.goal}</p>
              </div>
              
              <div className="flex items-center gap-2 w-full md:w-auto pt-4 md:pt-0 border-t border-[var(--border)] md:border-0 mt-4 md:mt-0">
                <button 
                  onClick={() => handleEditExisting(project)}
                  className="flex-1 md:flex-none px-4 py-2 bg-primary/10 text-primary hover:bg-primary/20 rounded-lg text-sm font-bold transition-colors flex items-center justify-center gap-2"
                >
                  <Edit2 className="w-4 h-4" /> View / Edit
                </button>
                <button 
                  onClick={() => handleDuplicate(project)}
                  className="p-2 text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--muted)] rounded-lg transition-colors"
                  title="Duplicate"
                >
                  <Copy className="w-5 h-5" />
                </button>
                <button 
                  onClick={() => handleDelete(project.id)}
                  className="p-2 text-red-500/70 hover:text-red-600 hover:bg-red-500/10 rounded-lg transition-colors"
                  title="Delete"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10 max-w-4xl mx-auto">
      {/* Top Context Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-[var(--card)] border border-[var(--border)] p-3 rounded-xl shadow-sm text-center">
          <p className="text-[10px] font-bold text-[var(--muted-foreground)] uppercase tracking-wider mb-1">Skill</p>
          <p className="font-bold text-primary text-sm truncate" title={userContext.skill}>{userContext.skill}</p>
        </div>
        <div className="bg-[var(--card)] border border-[var(--border)] p-3 rounded-xl shadow-sm text-center">
          <p className="text-[10px] font-bold text-[var(--muted-foreground)] uppercase tracking-wider mb-1">Service</p>
          <p className="font-bold text-primary text-sm truncate" title={userContext.service}>{userContext.service}</p>
        </div>
        <div className="bg-[var(--card)] border border-[var(--border)] p-3 rounded-xl shadow-sm text-center">
          <p className="text-[10px] font-bold text-[var(--muted-foreground)] uppercase tracking-wider mb-1">Niche</p>
          <p className="font-bold text-primary text-sm truncate" title={userContext.niche}>{userContext.niche}</p>
        </div>
        <div className="bg-[var(--card)] border border-[var(--border)] p-3 rounded-xl shadow-sm text-center">
          <p className="text-[10px] font-bold text-[var(--muted-foreground)] uppercase tracking-wider mb-1">Offer</p>
          <p className="font-bold text-primary text-sm truncate" title={userContext.offerTitle}>{userContext.offerTitle}</p>
        </div>
      </div>

      {!currentProject && !loading && (
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-10 shadow-sm flex flex-col items-center text-center">
          <h2 className="text-2xl font-bold mb-4">No portfolio? No problem.</h2>
          <p className="text-[var(--muted-foreground)] mb-8 max-w-md">
            Let's generate a realistic practice project tailored to your service. You can build it, put it in your portfolio, and prove you can do the work.
          </p>
          <button
            onClick={handleGenerate}
            disabled={loading || saving}
            className="w-full max-w-md py-4 px-6 bg-[var(--foreground)] text-[var(--background)] rounded-xl font-bold hover:bg-[var(--foreground)]/90 transition-all flex items-center justify-center gap-2 text-lg shadow-md disabled:opacity-50"
          >
            <Sparkles className="w-5 h-5" />
            Generate Practice Project
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
          
          {existingProjects.length > 0 && (
            <button 
              onClick={() => setViewState('list')}
              className="mt-4 text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
            >
              Cancel
            </button>
          )}
        </div>
      )}

      {loading && (
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-10 shadow-sm flex flex-col items-center text-center animate-pulse">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
          <h2 className="text-xl font-bold">Creating your practice portfolio project...</h2>
          <p className="text-[var(--muted-foreground)] mt-2">Inventing a fictional client that needs exactly what you offer.</p>
        </div>
      )}

      {currentProject && (
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
          
          <div className="p-4 md:p-6 border-b border-[var(--border)] bg-[var(--muted)]/30 flex justify-between items-center sticky top-0 z-10 backdrop-blur-md">
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-bold">Project Brief</h2>
              <span className="hidden sm:inline-block bg-blue-500/10 text-blue-600 border border-blue-500/20 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                Practice Project
              </span>
            </div>
            <div className="flex gap-2">
              {existingProjects.length > 0 && !currentProject.id && (
                <button 
                  onClick={() => {
                    setCurrentProject(null);
                    setViewState('list');
                  }} 
                  className="px-4 py-2 border border-[var(--border)] bg-[var(--card)] rounded-lg text-sm font-medium hover:bg-[var(--muted)] transition-colors hidden sm:flex items-center gap-2"
                >
                  <X className="w-4 h-4" /> Cancel
                </button>
              )}
              {!currentProject.id && (
                <button 
                  onClick={handleGenerate} 
                  className="px-4 py-2 border border-[var(--border)] bg-[var(--card)] rounded-lg text-sm font-medium hover:bg-[var(--muted)] transition-colors hidden md:block"
                >
                  Regenerate
                </button>
              )}
              <button 
                onClick={handleSave} 
                disabled={saving}
                className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-bold hover:bg-primary/90 transition-colors flex items-center gap-2"
              >
                {saving ? "Saving..." : <><Save className="w-4 h-4" /> Save Project</>}
              </button>
            </div>
          </div>

          {error && (
            <div className="p-4 mx-6 md:mx-8 mt-6 bg-red-500/10 border border-red-500/20 text-red-600 rounded-xl text-center">
              {error === "LIMIT_REACHED" ? (
                <div>
                  <p className="font-bold mb-2">You've reached your maximum saved projects limit.</p>
                  <button onClick={() => router.push("/pricing")} className="px-4 py-2 bg-red-500 text-white font-bold rounded-lg hover:bg-red-600 transition-colors">Upgrade to Pro</button>
                </div>
              ) : (
                <p className="font-medium text-sm">{error}</p>
              )}
            </div>
          )}

          <div className="p-6 md:p-8 space-y-8">
            
            {/* Top Info */}
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[var(--muted-foreground)] uppercase tracking-wider mb-2">Project Title</label>
                <input 
                  type="text" 
                  value={currentProject.title} 
                  onChange={(e) => updateField("title", e.target.value)}
                  className="w-full px-4 py-3 text-2xl font-bold border border-[var(--border)] rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 bg-[var(--background)]"
                />
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[var(--muted-foreground)] uppercase tracking-wider mb-2">Fictional Client</label>
                  <input 
                    type="text" 
                    value={currentProject.practiceClient} 
                    onChange={(e) => updateField("practiceClient", e.target.value)}
                    className="w-full px-3 py-2 border border-[var(--border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 bg-[var(--background)] font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[var(--muted-foreground)] uppercase tracking-wider mb-2">Industry</label>
                  <input 
                    type="text" 
                    value={currentProject.industry} 
                    onChange={(e) => updateField("industry", e.target.value)}
                    className="w-full px-3 py-2 border border-[var(--border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 bg-[var(--background)] font-medium"
                  />
                </div>
              </div>
            </div>

            {/* Context Grid */}
            <div className="grid md:grid-cols-2 gap-6 bg-[var(--muted)]/20 p-6 rounded-xl border border-[var(--border)]">
              <div>
                <label className="block text-xs font-bold text-[var(--muted-foreground)] uppercase tracking-wider mb-2">Project Background</label>
                <textarea 
                  value={currentProject.background} 
                  onChange={(e) => updateField("background", e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-[var(--border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 bg-[var(--background)] min-h-[100px]"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-red-500 uppercase tracking-wider mb-2">The Problem</label>
                <textarea 
                  value={currentProject.problem} 
                  onChange={(e) => updateField("problem", e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-[var(--border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 bg-[var(--background)] min-h-[100px]"
                />
              </div>
            </div>

            {/* Core Goal */}
            <div className="bg-primary/5 p-6 rounded-xl border border-primary/20">
              <label className="block text-xs font-bold text-primary uppercase tracking-wider mb-2">The Goal</label>
              <textarea 
                value={currentProject.goal} 
                onChange={(e) => updateField("goal", e.target.value)}
                className="w-full px-3 py-2 text-lg font-medium border border-[var(--border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 bg-[var(--background)] min-h-[80px]"
              />
            </div>

            {/* Requirements & Direction */}
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-[var(--muted-foreground)] uppercase tracking-wider mb-3">Deliverables Required</label>
                <textarea 
                  value={currentProject.deliverables} 
                  onChange={(e) => updateField("deliverables", e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-[var(--border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 bg-[var(--background)] min-h-[150px]"
                />
              </div>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-bold text-[var(--muted-foreground)] uppercase tracking-wider mb-2">Target Audience</label>
                  <input 
                    type="text" 
                    value={currentProject.targetAudience} 
                    onChange={(e) => updateField("targetAudience", e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-[var(--border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 bg-[var(--background)]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[var(--muted-foreground)] uppercase tracking-wider mb-2">Creative Direction</label>
                  <textarea 
                    value={currentProject.creativeDirection} 
                    onChange={(e) => updateField("creativeDirection", e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-[var(--border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 bg-[var(--background)] min-h-[60px]"
                  />
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-[var(--muted-foreground)] uppercase tracking-wider mb-2">Suggested Tools</label>
                <input 
                  type="text" 
                  value={currentProject.suggestedTools} 
                  onChange={(e) => updateField("suggestedTools", e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-[var(--border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 bg-[var(--background)]"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[var(--muted-foreground)] uppercase tracking-wider mb-2">Success Criteria</label>
                <input 
                  type="text" 
                  value={currentProject.successCriteria} 
                  onChange={(e) => updateField("successCriteria", e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-[var(--border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 bg-[var(--background)]"
                />
              </div>
            </div>

            <hr className="border-[var(--border)]" />

            {/* Ready to Use Description */}
            <div className="bg-[var(--foreground)] text-[var(--background)] p-6 md:p-8 rounded-xl">
              <div className="flex items-center gap-3 mb-4">
                <FileText className="w-6 h-6 text-primary" />
                <h3 className="text-xl font-bold">Portfolio Description</h3>
              </div>
              <p className="text-sm text-[var(--muted)] mb-4">
                When you finish building this project, use this exact description on your portfolio website to present it professionally. It is pre-written to avoid fabricating false metrics.
              </p>
              <textarea 
                value={currentProject.portfolioDescription} 
                onChange={(e) => updateField("portfolioDescription", e.target.value)}
                className="w-full px-4 py-3 text-sm border border-[var(--border)]/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 bg-[var(--background)]/10 text-[var(--background)] min-h-[250px] leading-relaxed"
              />
            </div>

            <div className="pt-4 flex justify-end">
              <button 
                onClick={handleSave} 
                disabled={saving}
                className="px-8 py-4 bg-primary text-white rounded-xl text-lg font-bold hover:bg-primary/90 transition-colors flex items-center gap-2 shadow-md w-full sm:w-auto justify-center"
              >
                {saving ? "Saving Project..." : "Save Project"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
