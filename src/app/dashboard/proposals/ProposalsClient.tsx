"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Filter, Trash2, ChevronRight, FileText, CheckCircle, XCircle, Clock } from "lucide-react";
import Link from "next/link";

export function ProposalsClient({ existingProposals }: { existingProposals: any[] }) {
  const router = useRouter();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const filteredProposals = existingProposals.filter(p => {
    const titleMatch = p.title?.toLowerCase().includes(searchQuery.toLowerCase());
    const prospectMatch = p.prospect?.name?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSearch = titleMatch || prospectMatch;
    const matchesStatus = statusFilter === "All" || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this proposal?")) return;
    
    try {
      const res = await fetch(`/api/proposal/delete?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        router.refresh();
      }
    } catch (error) {
      console.error(error);
    }
  };

  if (existingProposals.length === 0) {
    return (
      <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-12 shadow-sm text-center">
        <div className="w-16 h-16 bg-[var(--muted)] rounded-full flex items-center justify-center mx-auto mb-4">
          <FileText className="w-8 h-8 text-[var(--muted-foreground)]" />
        </div>
        <h3 className="text-xl font-bold mb-2">No proposals yet.</h3>
        <p className="text-[var(--muted-foreground)] mb-6 max-w-md mx-auto">
          Generate your first proposal to start closing clients and tracking your success.
        </p>
        <button 
          onClick={() => router.push('/dashboard/proposal')}
          className="px-6 py-3 bg-primary text-white rounded-lg font-bold hover:bg-primary/90 transition-colors inline-flex items-center gap-2"
        >
          Create Your First Proposal
        </button>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Draft': return 'bg-[var(--muted)] text-[var(--muted-foreground)]';
      case 'Ready': return 'bg-blue-500/10 text-blue-600';
      case 'Sent': return 'bg-purple-500/10 text-purple-600';
      case 'Accepted': return 'bg-green-500/10 text-green-600';
      case 'Declined': return 'bg-red-500/10 text-red-600';
      default: return 'bg-[var(--muted)] text-[var(--muted-foreground)]';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]" />
            <input 
              type="text" 
              placeholder="Search proposals..." 
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
              <option value="Draft">Draft</option>
              <option value="Ready">Ready</option>
              <option value="Sent">Sent</option>
              <option value="Accepted">Accepted</option>
              <option value="Declined">Declined</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-[var(--muted)]/50 text-[var(--muted-foreground)] border-b border-[var(--border)]">
              <tr>
                <th className="px-6 py-3 font-bold uppercase tracking-wider text-xs">Project / Client</th>
                <th className="px-6 py-3 font-bold uppercase tracking-wider text-xs">Price</th>
                <th className="px-6 py-3 font-bold uppercase tracking-wider text-xs">Status</th>
                <th className="px-6 py-3 font-bold uppercase tracking-wider text-xs">Last Updated</th>
                <th className="px-6 py-3 text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {filteredProposals.map((proposal) => (
                <tr key={proposal.id} className="hover:bg-[var(--muted)]/20 transition-colors group cursor-pointer" onClick={() => router.push(`/dashboard/proposals/${proposal.id}`)}>
                  <td className="px-6 py-4">
                    <p className="font-bold text-[var(--foreground)]">{proposal.title || "Untitled Proposal"}</p>
                    <p className="text-xs text-[var(--muted-foreground)] mt-0.5">{proposal.prospect?.name || "No Client Assigned"}</p>
                  </td>
                  <td className="px-6 py-4 font-medium">{proposal.price || "TBD"}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${getStatusColor(proposal.status)}`}>
                      {proposal.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-[var(--muted-foreground)]">
                    {new Date(proposal.updatedAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={(e) => handleDelete(proposal.id, e)} className="p-1.5 text-red-500 hover:bg-red-500/10 rounded transition-colors" title="Delete">
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <ChevronRight className="w-5 h-5 text-[var(--muted-foreground)]" />
                    </div>
                  </td>
                </tr>
              ))}
              {filteredProposals.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-[var(--muted-foreground)]">
                    No proposals match your search or filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
