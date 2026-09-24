"use client";

import Link from "next/link";
import { SearchX, ArrowRight } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[var(--background)] flex items-center justify-center p-6 text-center">
      <div className="max-w-md w-full space-y-6">
        <div className="w-20 h-20 bg-[var(--muted)] rounded-full flex items-center justify-center mx-auto mb-4">
          <SearchX className="w-10 h-10 text-[var(--muted-foreground)]" />
        </div>
        <h1 className="text-4xl font-bold tracking-tight">404 - Page Not Found</h1>
        <p className="text-[var(--muted-foreground)] text-lg">
          We couldn't find the page you're looking for. It might have been moved or doesn't exist.
        </p>
        <div className="pt-4">
          <Link 
            href="/dashboard"
            className="inline-flex items-center justify-center w-full py-4 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-all shadow-md gap-2"
          >
            Return to Dashboard <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
