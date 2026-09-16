"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const supabase = createClient();
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(
        email,
        {
          redirectTo:
            typeof window !== "undefined"
              ? `${window.location.origin}/auth/callback?next=/reset-password`
              : undefined,
        }
      );
      if (resetError) throw resetError;
      setSent(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to send reset email.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-md px-4 py-20 sm:px-6">
      <h1 className="font-serif text-2xl text-stone-900">Reset Password</h1>
      <p className="mt-2 text-sm text-stone-600">
        Enter your email and we&apos;ll send you a link to reset your password.
      </p>

      {sent ? (
        <p className="mt-6 rounded-md border border-stone-200 bg-stone-50 p-4 text-sm text-stone-700">
          Check your inbox at <strong>{email}</strong> for a reset link.
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <input
            type="email"
            required
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-md border border-stone-300 px-3 py-2 text-sm"
          />
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-accent px-8 py-3 text-sm font-medium text-white hover:bg-accent-hover disabled:opacity-50"
          >
            {loading ? "Sending..." : "Send Reset Link"}
          </button>
        </form>
      )}
    </div>
  );
}
