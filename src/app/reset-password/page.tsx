"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Sparkles, ArrowLeft } from "lucide-react";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match");
      setStatus("error");
      return;
    }

    if (password.length < 8) {
      setErrorMessage("Password must be at least 8 characters");
      setStatus("error");
      return;
    }

    setStatus("loading");
    setErrorMessage("");

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Something went wrong");
      }

      setStatus("success");
      setTimeout(() => {
        router.push("/login");
      }, 3000);
    } catch (error: any) {
      setErrorMessage(error.message);
      setStatus("error");
    }
  };

  if (!token) {
    return (
      <div className="text-center p-4">
        <p className="text-red-500 mb-4">Invalid or missing reset token.</p>
        <Link href="/forgot-password" className="text-primary hover:underline flex items-center justify-center gap-2">
          <ArrowLeft className="w-4 h-4" /> Request new link
        </Link>
      </div>
    );
  }

  return (
    <>
      {status === "error" && (
        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 text-red-600 text-sm rounded-lg">
          {errorMessage}
        </div>
      )}

      {status === "success" ? (
        <div className="text-center space-y-4">
          <div className="p-3 bg-green-500/10 border border-green-500/20 text-green-600 text-sm rounded-lg">
            Password reset successfully! Redirecting to login...
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">New Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-[var(--border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 bg-transparent"
              placeholder="••••••••"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Confirm New Password</label>
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-3 py-2 border border-[var(--border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 bg-transparent"
              placeholder="••••••••"
            />
          </div>
          <button
            type="submit"
            disabled={status === "loading"}
            className="w-full py-2 px-4 bg-[var(--foreground)] text-[var(--background)] rounded-lg font-medium hover:bg-[var(--foreground)]/90 transition-colors disabled:opacity-50"
          >
            {status === "loading" ? "Resetting..." : "Reset Password"}
          </button>
        </form>
      )}
    </>
  );
}

export default function ResetPasswordPage() {
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
          <h1 className="text-2xl font-bold text-center">Set New Password</h1>
        </div>

        <Suspense fallback={<div className="text-center">Loading...</div>}>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  );
}
