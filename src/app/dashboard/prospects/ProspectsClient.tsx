"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Search, Filter, Trash2, ChevronRight, Edit2, CheckCircle2 } from "lucide-react";
import Link from "next/link";

export function ProspectsClient({ 
  existingProspects, 
  userContext 
}: { 
  existingProspects: any[],
  userContext: { skill: string, service: string, niche: string, offerTitle: string }
}) {
  const router = useRouter();
  
  const [viewState, setViewState] = useState<'list' | 'add'>('list');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const [formData, setFormData] = useState({
    name: "",
    industry: "",
    website: "",
    socialUrl: "",
    platform: "Instagram",
    location: "",
    contactName: "",
    contactEmail: "",
    observedProblem: "",
    notes: ""
  });

  const filteredProspects = existingProspects.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (p.industry && p.industry.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesStatus = statusFilter === "All" || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/prospects/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        setFormData({
          name: "", industry: "", website: "", socialUrl: "", platform: "Instagram",
          location: "", contactName: "", contactEmail: "", observedProblem: "", notes: ""
        });
        setViewState('list');
        router.refresh();
      } else {
        const data = await res.json().catch(() => ({}));
        if (data.error === "LIMIT_REACHED") {
          setError("LIMIT_REACHED");
        } else {
          setError("Failed to save prospect.");
        }
      }
    } catch (error) {
      setError("Failed to save prospect.");
    }
    setSaving(false);
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this prospect?")) return;
    
    try {
      const res = await fetch(`/api/prospects/delete?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        router.refresh();
      }
    } catch (error) {
      console.error(error);
    }
  };

  if (viewState === 'add') {
    return (
      <div className="max-w-2xl mx-auto bg-[var(--card)] border border-[var(--border)] rounded-2xl shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4">
        <div className="p-6 border-b border-[var(--border)] bg-[var(--muted)]/30">
          <h2 className="text-xl font-bold">Add a Prospect</h2>
          <p className="text-sm text-[var(--muted-foreground)]">Add someone who matches your niche and needs your service.</p>
        </div>
        <form onSubmit={handleSave} className="p-6 space-y-6">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-[var(--muted-foreground)] uppercase tracking-wider mb-2">Business / Person Name *</label>
              <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-3 py-2 border border-[var(--border)] rounded-lg focus:ring-2 focus:ring-primary/50 bg-[var(--background)]" />
            </div>
            <div>
              <label className="block text-xs font-bold text-[var(--muted-foreground)] uppercase tracking-wider mb-2">Industry</label>
              <input type="text" value={formData.industry} onChange={e => setFormData({...formData, industry: e.target.value})} className="w-full px-3 py-2 border border-[var(--border)] rounded-lg focus:ring-2 focus:ring-primary/50 bg-[var(--background)]" />
            </div>
            <div>
              <label className="block text-xs font-bold text-[var(--muted-foreground)] uppercase tracking-wider mb-2">Platform</label>
              <select value={formData.platform} onChange={e => setFormData({...formData, platform: e.target.value})} className="w-full px-3 py-2 border border-[var(--border)] rounded-lg focus:ring-2 focus:ring-primary/50 bg-[var(--background)]">
                <option>Instagram</option><option>LinkedIn</option><option>Email</option><option>Facebook</option><option>Website</option><option>Upwork</option><option>Other</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-[var(--muted-foreground)] uppercase tracking-wider mb-2">Website</label>
              <input type="url" value={formData.website} onChange={e => setFormData({...formData, website: e.target.value})} className="w-full px-3 py-2 border border-[var(--border)] rounded-lg focus:ring-2 focus:ring-primary/50 bg-[var(--background)]" />
            </div>
            <div>
              <label className="block text-xs font-bold text-[var(--muted-foreground)] uppercase tracking-wider mb-2">Social Media URL</label>
              <input type="url" value={formData.socialUrl} onChange={e => setFormData({...formData, socialUrl: e.target.value})} className="w-full px-3 py-2 border border-[var(--border)] rounded-lg focus:ring-2 focus:ring-primary/50 bg-[var(--background)]" />
            </div>
            <div>
              <label className="block text-xs font-bold text-[var(--muted-foreground)] uppercase tracking-wider mb-2">Contact Name</label>
              <input type="text" value={formData.contactName} onChange={e => setFormData({...formData, contactName: e.target.value})} className="w-full px-3 py-2 border border-[var(--border)] rounded-lg focus:ring-2 focus:ring-primary/50 bg-[var(--background)]" />
            </div>
            <div>
              <label className="block text-xs font-bold text-[var(--muted-foreground)] uppercase tracking-wider mb-2">Contact Email</label>
              <input type="email" value={formData.contactEmail} onChange={e => setFormData({...formData, contactEmail: e.target.value})} className="w-full px-3 py-2 border border-[var(--border)] rounded-lg focus:ring-2 focus:ring-primary/50 bg-[var(--background)]" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-[var(--muted-foreground)] uppercase tracking-wider mb-2">Location</label>
              <input type="text" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} className="w-full px-3 py-2 border border-[var(--border)] rounded-lg focus:ring-2 focus:ring-primary/50 bg-[var(--background)]" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-[var(--muted-foreground)] uppercase tracking-wider mb-2">Observed Problem (Why do they need you?)</label>
              <textarea value={formData.observedProblem} onChange={e => setFormData({...formData, observedProblem: e.target.value})} className="w-full px-3 py-2 text-sm border border-[var(--border)] rounded-lg focus:ring-2 focus:ring-primary/50 bg-[var(--background)] min-h-[80px]" placeholder="e.g. They post great food pics but their videos are blurry and unedited..." />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-[var(--muted-foreground)] uppercase tracking-wider mb-2">Notes</label>
              <textarea value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} className="w-full px-3 py-2 text-sm border border-[var(--border)] rounded-lg focus:ring-2 focus:ring-primary/50 bg-[var(--background)] min-h-[80px]" />
            </div>
          </div>
          
          {error && (
            <div className="pt-4 flex justify-end">
              <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-600 rounded-lg text-sm w-full sm:w-auto text-right">
                {error === "LIMIT_REACHED" ? (
                  <span className="flex items-center gap-2">
                    You've reached your maximum prospects limit. <button type="button" onClick={() => router.push("/pricing")} className="underline font-bold">Upgrade</button>
                  </span>
                ) : error}
              </div>
            </div>
          )}
          
          <div className="pt-4 border-t border-[var(--border)] flex justify-end gap-3">
            <button type="button" onClick={() => { setViewState('list'); setError(null); }} className="px-4 py-2 border border-[var(--border)] rounded-lg font-medium hover:bg-[var(--muted)]">Cancel</button>
            <button type="submit" disabled={saving || !formData.name} className="px-6 py-2 bg-primary text-white rounded-lg font-bold hover:bg-primary/90 disabled:opacity-50">
              {saving ? "Saving..." : "Save Prospect"}
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Context */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-[var(--card)] border border-[var(--border)] p-3 rounded-xl shadow-sm">
          <p className="text-[10px] font-bold text-[var(--muted-foreground)] uppercase tracking-wider">Service</p>
          <p className="font-bold text-sm truncate">{userContext.service}</p>
        </div>
        <div className="bg-[var(--card)] border border-[var(--border)] p-3 rounded-xl shadow-sm">
          <p className="text-[10px] font-bold text-[var(--muted-foreground)] uppercase tracking-wider">Niche</p>
          <p className="font-bold text-sm truncate">{userContext.niche}</p>
        </div>
        <div className="bg-[var(--card)] border border-[var(--border)] p-3 rounded-xl shadow-sm md:col-span-2">
          <p className="text-[10px] font-bold text-[var(--muted-foreground)] uppercase tracking-wider">Offer</p>
          <p className="font-bold text-sm truncate">{userContext.offerTitle}</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]" />
            <input 
              type="text" 
              placeholder="Search prospects..." 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-[var(--border)] rounded-lg text-sm bg-[var(--card)] focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
          <div className="relative">
            <Filter className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]" />
            <select 
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="pl-9 pr-8 py-2 border border-[var(--border)] rounded-lg text-sm bg-[var(--card)] focus:outline-none focus:ring-2 focus:ring-primary/50 appearance-none"
            >
              <option value="All">All Statuses</option>
              <option value="New">New</option>
              <option value="Contacted">Contacted</option>
              <option value="Replied">Replied</option>
              <option value="Interested">Interested</option>
              <option value="Proposal Sent">Proposal Sent</option>
              <option value="Won">Won</option>
              <option value="Not Interested">Not Interested</option>
            </select>
          </div>
        </div>
        
        <button 
          onClick={() => setViewState('add')}
          className="w-full sm:w-auto px-4 py-2 bg-[var(--foreground)] text-[var(--background)] rounded-lg text-sm font-bold hover:bg-[var(--foreground)]/90 transition-all flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" /> Add Prospect
        </button>
      </div>

      {existingProspects.length === 0 ? (
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-12 shadow-sm text-center">
          <div className="w-16 h-16 bg-[var(--muted)] rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="w-8 h-8 text-[var(--muted-foreground)]" />
          </div>
          <h3 className="text-xl font-bold mb-2">You haven't added any prospects yet.</h3>
          <p className="text-[var(--muted-foreground)] mb-6 max-w-md mx-auto">
            Find businesses or individuals in your niche who could benefit from your offer, and add them here to start tracking your outreach.
          </p>
          <button 
            onClick={() => setViewState('add')}
            className="px-6 py-3 bg-primary text-white rounded-lg font-bold hover:bg-primary/90 transition-colors inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Add Your First Prospect
          </button>
        </div>
      ) : (
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-[var(--muted)]/50 text-[var(--muted-foreground)] border-b border-[var(--border)]">
                <tr>
                  <th className="px-6 py-3 font-bold uppercase tracking-wider text-xs">Name</th>
                  <th className="px-6 py-3 font-bold uppercase tracking-wider text-xs">Industry</th>
                  <th className="px-6 py-3 font-bold uppercase tracking-wider text-xs">Platform</th>
                  <th className="px-6 py-3 font-bold uppercase tracking-wider text-xs">Status</th>
                  <th className="px-6 py-3 font-bold uppercase tracking-wider text-xs">Date Added</th>
                  <th className="px-6 py-3 text-right"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {filteredProspects.map((prospect) => (
                  <tr key={prospect.id} className="hover:bg-[var(--muted)]/20 transition-colors group cursor-pointer" onClick={() => router.push(`/dashboard/prospects/${prospect.id}`)}>
                    <td className="px-6 py-4 font-bold text-[var(--foreground)]">{prospect.name}</td>
                    <td className="px-6 py-4 text-[var(--muted-foreground)]">{prospect.industry || "—"}</td>
                    <td className="px-6 py-4 text-[var(--muted-foreground)]">{prospect.platform || "—"}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider
                        ${prospect.status === 'New' ? 'bg-blue-500/10 text-blue-600' : 
                          prospect.status === 'Won' ? 'bg-green-500/10 text-green-600' : 
                          prospect.status === 'Contacted' ? 'bg-purple-500/10 text-purple-600' : 
                          'bg-[var(--muted)] text-[var(--muted-foreground)]'}`}
                      >
                        {prospect.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-[var(--muted-foreground)]">
                      {new Date(prospect.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={(e) => handleDelete(prospect.id, e)} className="p-1.5 text-red-500 hover:bg-red-500/10 rounded transition-colors" title="Delete">
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <ChevronRight className="w-5 h-5 text-[var(--muted-foreground)]" />
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredProspects.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-[var(--muted-foreground)]">
                      No prospects match your search or filter.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
