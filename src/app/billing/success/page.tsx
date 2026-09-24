"use client";

import { Suspense, useEffect, useState } from "react";
import { CheckCircle2, Loader2, ArrowRight } from "lucide-react";
import Link from "next/link";

function BillingSuccessContent() {
  const [status, setStatus] = useState<"processing" | "completed" | "delayed">("processing");

  useEffect(() => {
    let isMounted = true;
    let attempts = 0;
    const maxAttempts = 10;
    
    const checkStatus = async () => {
      try {
        const res = await fetch("/api/billing/status");
        if (res.ok) {
          const data = await res.json();
          if (data.plan === "PRO") {
            if (isMounted) setStatus("completed");
            return;
          }
        }
      } catch (error) {
        console.error(error);
      }
      
      attempts++;
      if (attempts < maxAttempts) {
        setTimeout(checkStatus, 2000);
      } else {
        if (isMounted) setStatus("delayed");
      }
    };

    checkStatus();
    
    return () => { isMounted = false; };
  }, []);

  return (
    <div className="min-h-screen bg-[var(--background)] flex items-center justify-center p-6">
      <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-10 max-w-md w-full text-center shadow-md animate-in fade-in zoom-in duration-500">
        
        {status === "processing" ? (
          <>
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
            <h1 className="text-2xl font-bold mb-4">Your payment is being confirmed.</h1>
            <p className="text-[var(--muted-foreground)] mb-8">
              Please wait while we confirm your subscription with the payment provider.
            </p>
          </>
        ) : status === "delayed" ? (
          <>
            <div className="w-16 h-16 bg-yellow-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-8 h-8 text-yellow-500" />
            </div>
            <h1 className="text-2xl font-bold mb-4">Payment Received</h1>
            <p className="text-[var(--muted-foreground)] mb-8">
              Your payment was received. Your PRO access will appear shortly.
            </p>
            <Link 
              href="/dashboard"
              className="inline-flex w-full py-4 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-all shadow items-center justify-center gap-2"
            >
              Go to Dashboard <ArrowRight className="w-5 h-5" />
            </Link>
          </>
        ) : (
          <>
            <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-8 h-8 text-green-500" />
            </div>
            <h1 className="text-2xl font-bold mb-4">Welcome to FIRST CLIENT AI PRO!</h1>
            <p className="text-[var(--muted-foreground)] mb-8">
              Your payment has been successfully processed and your account is upgraded.
            </p>
            <Link 
              href="/dashboard"
              className="inline-flex w-full py-4 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-all shadow items-center justify-center gap-2"
            >
              Go to Dashboard <ArrowRight className="w-5 h-5" />
            </Link>
          </>
        )}
        
      </div>
    </div>
  );
}

export default function BillingSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center p-6">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
      </div>
    }>
      <BillingSuccessContent />
    </Suspense>
  );
}
