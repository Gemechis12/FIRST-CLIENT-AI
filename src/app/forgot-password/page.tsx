"use client";

import { useState } from "react";
import Link from "next/link";
import { Sparkles, ArrowLeft } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setErrorMessage("");

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Something went wrong");
      }

      setStatus("success");
    } catch (error: any) {
      setErrorMessage(error.message);
      setStatus("error");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--muted)]/30 px-4">
      <div className="w-full max-w-md p-8 bg-[var(--card)] border border-[var(--border)] rounded-2xl shadow-sm">
        <div className="flex flex-col items-center mb-8">
          <Link href="/" className="flex items-center gap-2 mb-6">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl tracking-tight">FIRST CLIENT AI</span>
          </Link>
          <h1 className="text-2xl font-bold text-center">Reset Password</h1>
          <p className="text-[var(--muted-foreground)] text-sm text-center mt-2">
            Enter your email to receive a password reset link
          </p>
        </div>

        {status === "error" && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 text-red-600 text-sm rounded-lg">
            {errorMessage}
          </div>
        )}

        {status === "success" ? (
          <div className="text-center space-y-4">
            <div className="p-3 bg-green-500/10 border border-green-500/20 text-green-600 text-sm rounded-lg">
              If an account exists with that email, we've sent a reset link. Please check your inbox.
            </div>
            <Link href="/login" className="inline-block mt-4 text-sm text-primary hover:underline flex items-center justify-center gap-2">
              <ArrowLeft className="w-4 h-4" /> Back to Login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-[var(--border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 bg-transparent"
                placeholder="you@example.com"
              />
            </div>
            <button
              type="submit"
              disabled={status === "loading"}
              className="w-full py-2 px-4 bg-[var(--foreground)] text-[var(--background)] rounded-lg font-medium hover:bg-[var(--foreground)]/90 transition-colors disabled:opacity-50"
            >
              {status === "loading" ? "Sending..." : "Send Reset Link"}
            </button>
            <div className="text-center mt-4">
              <Link href="/login" className="text-sm text-[var(--muted-foreground)] hover:text-primary transition-colors flex items-center justify-center gap-2">
                <ArrowLeft className="w-4 h-4" /> Back to Login
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
