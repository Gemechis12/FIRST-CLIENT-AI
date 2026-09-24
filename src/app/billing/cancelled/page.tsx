import { XCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function BillingCancelledPage() {
  return (
    <div className="min-h-screen bg-[var(--background)] flex items-center justify-center p-6">
      <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-10 max-w-md w-full text-center shadow-md animate-in fade-in zoom-in duration-500">
        
        <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <XCircle className="w-8 h-8 text-red-500" />
        </div>
        <h1 className="text-2xl font-bold mb-4">Checkout Cancelled</h1>
        <p className="text-[var(--muted-foreground)] mb-8">
          Your checkout was cancelled and you haven't been charged.
        </p>
        
        <Link 
          href="/pricing"
          className="inline-flex w-full py-4 border border-[var(--border)] bg-[var(--background)] rounded-xl font-bold hover:bg-[var(--muted)] transition-all shadow-sm items-center justify-center gap-2"
        >
          <ArrowLeft className="w-5 h-5" /> Return to Pricing
        </Link>
        
      </div>
    </div>
  );
}
