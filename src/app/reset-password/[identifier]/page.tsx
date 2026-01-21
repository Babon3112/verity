"use client";

import axios from "axios";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  ShieldAlert,
  KeyRound,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { useSession } from "next-auth/react";

const inputWrap =
  "flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 " +
  "transition focus-within:border-cyan-300/40 focus-within:bg-white/[0.07]";

const inputField =
  "w-full bg-transparent text-sm text-white placeholder:text-slate-500 outline-none";

const ResetPasswordPage = () => {
  const { data: session } = useSession();

  const [resetPasswordCode, setResetPasswordCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [loading, setLoading] = useState(false);

  const params = useParams();
  const router = useRouter();

  const identifier = useMemo(() => {
    const p = params?.identifier;
    if (!p) return "";
    if (Array.isArray(p)) return p[0] || "";
    return p;
  }, [params]);

  useEffect(() => {
    if (session) router.replace("/");
  }, [session, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    setIsError(false);

    if (!resetPasswordCode.trim()) {
      setMessage("Please enter the reset code.");
      setIsError(true);
      return;
    }

    if (password.length < 6) {
      setMessage("Password must be at least 6 characters.");
      setIsError(true);
      return;
    }

    if (password !== confirmPassword) {
      setMessage("Passwords do not match.");
      setIsError(true);
      return;
    }

    try {
      setLoading(true);

      await axios.post("/api/reset-password", {
        identifier,
        resetPasswordCode: resetPasswordCode.trim(),
        password,
        confirmPassword,
      });

      setMessage("Password reset successful. Redirecting…");
      setIsError(false);

      setTimeout(() => router.replace("/"), 700);
    } catch (err: any) {
      setMessage(err?.response?.data?.message || "Something went wrong");
      setIsError(true);
    } finally {
      setLoading(false);
    }
  };

  const canSubmit =
    !loading &&
    !!identifier &&
    resetPasswordCode.trim().length > 0 &&
    password.length >= 6 &&
    confirmPassword.length >= 6 &&
    password === confirmPassword;

  return (
    <main className="relative min-h-screen bg-[#070B0C] px-4 text-white">
      {/* Background glow */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-cyan-400/10 blur-3xl" />
        <div className="absolute top-56 -right-35 h-96 w-96 rounded-full bg-fuchsia-400/10 blur-3xl" />
        <div className="absolute -bottom-40 -left-35 h-96 w-96 rounded-full bg-emerald-400/10 blur-3xl" />
      </div>

      <div className="relative flex min-h-screen items-center justify-center">
        <div
          className="
            w-full max-w-md overflow-hidden rounded-[30px]
            border border-white/10 bg-black/30 p-8
            backdrop-blur-xl
            shadow-[0_0_0_1px_rgba(255,255,255,0.03)]
          "
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Header */}
            <div className="text-center space-y-2">
              <div className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/5">
                <ShieldAlert className="h-5 w-5 text-cyan-300" />
              </div>

              <h1 className="text-xl font-semibold tracking-tight text-white">
                Set a new password
              </h1>

              <p className="text-sm text-slate-400">
                Enter your reset code and choose a new password.
              </p>

              {identifier && (
                <p className="text-xs text-slate-500">
                  Reset for:{" "}
                  <span className="text-slate-300">{identifier}</span>
                </p>
              )}
            </div>

            {/* Code */}
            <div className={inputWrap}>
              <KeyRound className="h-4 w-4 text-slate-400" />
              <input
                className={inputField}
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                placeholder="Reset code"
                value={resetPasswordCode}
                onChange={(e) => setResetPasswordCode(e.target.value)}
              />
            </div>

            {/* New password */}
            <div className={inputWrap}>
              <Lock className="h-4 w-4 text-slate-400" />
              <input
                className={inputField}
                type={showPassword ? "text" : "password"}
                placeholder="New password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />

              <button
                type="button"
                onClick={() => setShowPassword((p) => !p)}
                className="
                  rounded-xl border border-white/10 bg-white/5 p-1.5
                  text-slate-300 transition hover:bg-white/10 hover:text-white
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

            {/* Confirm password */}
            <div className={inputWrap}>
              <Lock className="h-4 w-4 text-slate-400" />
              <input
                className={inputField}
                type={showConfirm ? "text" : "password"}
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />

              <button
                type="button"
                onClick={() => setShowConfirm((p) => !p)}
                className="
                  rounded-xl border border-white/10 bg-white/5 p-1.5
                  text-slate-300 transition hover:bg-white/10 hover:text-white
                  active:scale-[0.98]
                "
                aria-label={showConfirm ? "Hide password" : "Show password"}
              >
                {showConfirm ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>

            {/* Message */}
            {message && (
              <div
                className={[
                  "rounded-2xl px-4 py-3 border",
                  isError
                    ? "border-red-500/20 bg-red-500/10"
                    : "border-emerald-500/20 bg-emerald-500/10",
                ].join(" ")}
              >
                <p
                  className={[
                    "flex items-center justify-center gap-2 text-sm text-center",
                    isError ? "text-red-200" : "text-emerald-200",
                  ].join(" ")}
                >
                  {isError ? (
                    <XCircle className="h-4 w-4" />
                  ) : (
                    <CheckCircle2 className="h-4 w-4" />
                  )}
                  {message}
                </p>
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
                  Resetting...
                </span>
              ) : (
                <span className="relative">Reset password</span>
              )}
            </button>

            <p className="text-center text-xs text-slate-500">
              Make sure your new password is something you’ll remember.
            </p>
          </form>
        </div>
      </div>
    </main>
  );
};

export default ResetPasswordPage;
