"use client";

import { useMemo, useState } from "react";
import { signIn } from "next-auth/react";
import { Eye, EyeOff, Lock, Mail, Loader2 } from "lucide-react";

const inputWrap =
  "flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 " +
  "transition focus-within:border-cyan-300/40 focus-within:bg-white/[0.07]";

const inputField =
  "w-full bg-transparent text-sm text-white placeholder:text-slate-500 outline-none";

const SignIn = () => {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const canSubmit = useMemo(() => {
    return identifier.trim().length > 0 && password.trim().length > 0 && !loading;
  }, [identifier, password, loading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!identifier.trim() || !password.trim()) {
      setError("Please fill in all fields.");
      return;
    }

    setLoading(true);

    try {
      const result = await signIn("credentials", {
        redirect: false,
        identifier,
        password,
      });

      if (result?.error) {
        setError(result.error);
      }
    } catch {
      setError("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-xl font-semibold text-white tracking-tight">
          Welcome back
        </h1>
        <p className="mt-1 text-sm text-slate-400">
          Sign in to continue to <span className="text-cyan-200">Verity</span>
        </p>
      </div>

      {/* Identifier */}
      <div className={inputWrap}>
        <Mail className="h-4 w-4 text-slate-400" />
        <input
          className={inputField}
          placeholder="Email or username"
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
        />
      </div>

      {/* Password */}
      <div className={inputWrap}>
        <Lock className="h-4 w-4 text-slate-400" />

        <input
          className={inputField}
          type={showPassword ? "text" : "password"}
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          type="button"
          onClick={() => setShowPassword((p) => !p)}
          className="
            rounded-xl border border-white/10 bg-white/5 p-1.5
            text-slate-300 transition
            hover:bg-white/10 hover:text-white
            active:scale-[0.98]
          "
          aria-label={showPassword ? "Hide password" : "Show password"}
        >
          {showPassword ? (
            <EyeOff className="h-4 w-4" />
          ) : (
            <Eye className="h-4 w-4" />
          )}
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3">
          <p className="text-sm text-red-200 text-center">{error}</p>
        </div>
      )}

      {/* Submit */}
      <button
        disabled={!canSubmit}
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
            Signing in...
          </span>
        ) : (
          <span className="relative">Sign in</span>
        )}
      </button>
    </form>
  );
};

export default SignIn;
