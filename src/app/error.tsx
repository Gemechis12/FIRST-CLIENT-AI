"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCcw, ArrowRight } from "lucide-react";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service in production
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[var(--background)] flex items-center justify-center p-6 text-center">
      <div className="max-w-md w-full space-y-6">
        <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertTriangle className="w-10 h-10 text-red-500" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight">Something went wrong</h1>
        <p className="text-[var(--muted-foreground)] text-lg">
          We encountered an unexpected error. Don't worry, our team has been notified.
        </p>
        <div className="pt-4 space-y-4">
          <button 
            onClick={() => reset()}
            className="inline-flex items-center justify-center w-full py-4 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-all shadow-md gap-2"
          >
            <RefreshCcw className="w-5 h-5" /> Try Again
          </button>
          
          <Link 
            href="/dashboard"
            className="inline-flex items-center justify-center w-full py-4 bg-[var(--card)] border border-[var(--border)] text-[var(--foreground)] rounded-xl font-bold hover:bg-[var(--muted)] transition-all gap-2"
          >
            Return to Dashboard <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
