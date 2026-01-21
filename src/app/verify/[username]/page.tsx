"use client";

import axios from "axios";
import { useSession } from "next-auth/react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  ShieldCheck,
  KeyRound,
  Loader2,
  CheckCircle2,
  XCircle,
} from "lucide-react";

const inputWrap =
  "flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 " +
  "transition focus-within:border-cyan-300/40 focus-within:bg-white/[0.07]";

const inputField =
  "w-full bg-transparent text-sm text-white placeholder:text-slate-500 outline-none";

const VerifyPage = () => {
  const { data: session } = useSession();

  const [verifyCode, setVerifyCode] = useState("");
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const params = useParams();

  const username = useMemo(() => {
    const u = params?.username;
    if (!u) return "";
    if (Array.isArray(u)) return u[0] || "";
    return u;
  }, [params]);

  useEffect(() => {
    if (session) router.replace("/");
  }, [session, router]);

  const verify = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    setIsError(false);

    const code = verifyCode.trim();

    if (!code) {
      setMessage("Please enter your verification code.");
      setIsError(true);
      return;
    }

    try {
      setLoading(true);

      const res = await axios.post("/api/verify", {
        username,
        verifyCode: code,
      });

      setMessage(res.data.message || "Verified successfully!");
      setIsError(false);

      router.replace("/");
    } catch (err: any) {
      setMessage(err?.response?.data?.message || "Verification failed");
      setIsError(true);
    } finally {
      setLoading(false);
    }
  };

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
          <form onSubmit={verify} className="space-y-4">
            {/* Header */}
            <div className="text-center space-y-2">
              <div className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/5">
                <ShieldCheck className="h-5 w-5 text-cyan-300" />
              </div>

              <h1 className="text-xl font-semibold text-white tracking-tight">
                Verify your account
              </h1>

              <p className="text-sm text-slate-400">
                Enter the code sent to your email
              </p>

              {username && (
                <p className="text-xs text-slate-500">
                  Verifying:{" "}
                  <span className="text-slate-300">@{username}</span>
                </p>
              )}
            </div>

            {/* Input */}
            <div className={inputWrap}>
              <KeyRound className="h-4 w-4 text-slate-400" />
              <input
                className={inputField}
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                value={verifyCode}
                onChange={(e) => setVerifyCode(e.target.value)}
                placeholder="Verification code"
              />
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

            {/* Button */}
            <button
              disabled={loading || !verifyCode.trim()}
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
                  Verifying...
                </span>
              ) : (
                <span className="relative">Verify account</span>
              )}
            </button>

            <p className="text-center text-xs text-slate-500">
              Didn’t receive it? Check spam/junk folder.
            </p>
          </form>
        </div>
      </div>
    </main>
  );
};

export default VerifyPage;
