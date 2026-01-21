"use client";

import axios from "axios";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { Mail, Loader2, Link2, CheckCircle2, AlertTriangle } from "lucide-react";

const inputWrap =
  "flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 " +
  "transition focus-within:border-cyan-300/40 focus-within:bg-white/[0.07]";

const inputField =
  "w-full bg-transparent text-sm text-white placeholder:text-slate-500 outline-none";

const ForgotPassword = () => {
  const [identifier, setIdentifier] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const router = useRouter();

  const canSubmit = useMemo(() => {
    return identifier.trim().length > 0 && !loading;
  }, [identifier, loading]);

  const handleSubmit = async () => {
    setError("");
    setSent(false);

    if (!identifier.trim()) {
      setError("Please enter your email or username.");
      return;
    }

    try {
      setLoading(true);

      const baseUrl = window.location.origin;
      const resetPasswordUrl = `${baseUrl}/reset-password/${encodeURIComponent(
        identifier.trim(),
      )}`;

      await axios.post("/api/forgot-password", {
        identifier: identifier.trim(),
        resetPasswordUrl,
      });

      setSent(true);

      // optional redirect (keep if your flow depends on it)
      setTimeout(() => {
        router.replace(
          `/reset-password/${encodeURIComponent(identifier.trim())}`,
        );
      }, 700);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to send reset link.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-xl font-semibold text-white tracking-tight">
          Reset your password
        </h1>
        <p className="mt-1 text-sm text-slate-400">
          We’ll send you a secure reset link.
        </p>
      </div>

      {/* Input */}
      <div className={inputWrap}>
        <Mail className="h-4 w-4 text-slate-400" />
        <input
          className={inputField}
          placeholder="Email or username"
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
        />
      </div>

      {/* Success */}
      {sent && !error && (
        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3">
          <p className="flex items-center justify-center gap-2 text-sm text-emerald-200">
            <CheckCircle2 className="h-4 w-4" />
            Reset link sent (check your inbox)
          </p>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3">
          <p className="flex items-center justify-center gap-2 text-sm text-red-200">
            <AlertTriangle className="h-4 w-4" />
            {error}
          </p>
        </div>
      )}

      {/* Button */}
      <button
        disabled={!canSubmit}
        onClick={handleSubmit}
        className="
          relative w-full rounded-2xl py-3.5 text-sm font-semibold text-black
          bg-linear-to-r from-cyan-300 to-emerald-200
          shadow-[0_10px_25px_-18px_rgba(34,211,238,0.65)]
          transition hover:brightness-110 active:scale-[0.99]
          disabled:bg-white/10 disabled:text-slate-500 disabled:cursor-not-allowed disabled:shadow-none
        "
      >
        {loading && (
          <span className="absolute inset-0 rounded-2xl bg-white/10 animate-pulse" />
        )}

        {loading ? (
          <span className="relative flex items-center justify-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            Sending...
          </span>
        ) : (
          <span className="relative flex items-center justify-center gap-2">
            <Link2 className="h-4 w-4" />
            Send reset link
          </span>
        )}
      </button>

      <p className="text-center text-xs text-slate-500">
        If you don’t see the email, check spam/junk folder.
      </p>
    </div>
  );
};

export default ForgotPassword;
