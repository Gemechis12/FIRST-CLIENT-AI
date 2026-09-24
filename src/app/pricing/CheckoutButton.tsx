"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles } from "lucide-react";

export function CheckoutButton({ planId, price }: { planId: string, price: number }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleCheckout = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: planId })
      });
      
      const data = await res.json();
      
      if (res.ok && data.url) {
        // Redirect to provider checkout url
        router.push(data.url);
      } else {
        alert(data.message || "Unable to start checkout. Please try again.");
        setLoading(false);
      }
    } catch (error) {
      console.error(error);
      alert("Unable to start checkout. Please try again.");
      setLoading(false);
    }
  };

  return (
    <button 
      onClick={handleCheckout} 
      disabled={loading}
      className="w-full py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
    >
      {loading ? "Opening checkout..." : (
        <>
          <Sparkles className="w-5 h-5" />
          Upgrade to Pro
        </>
      )}
    </button>
  );
}
