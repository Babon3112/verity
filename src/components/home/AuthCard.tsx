"use client";

import { useState } from "react";
import SignIn from "@/components/signin";
import SignUp from "@/components/signup";
import ForgotPassword from "@/components/forgotPassword";
import { Sparkles } from "lucide-react";

type AuthMode = "signin" | "signup" | "forgotPassword";

const AUTH_TABS: Extract<AuthMode, "signin" | "signup">[] = [
  "signin",
  "signup",
];

const AuthCard = () => {
  const [mode, setMode] = useState<AuthMode>("signin");

  return (
    <main className="relative min-h-screen bg-[#0B1112] px-4">
      {/* Background glow */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-cyan-400/10 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-emerald-400/10 blur-3xl" />
      </div>

      <div className="relative flex min-h-screen items-center justify-center">
        <div className="w-full max-w-md rounded-3xl border border-white/10 bg-[#0F1718] p-8 shadow-[0_0_0_1px_rgba(255,255,255,0.04)]">
          {/* Brand */}
          <div className="text-center space-y-2">
            <div className="mx-auto inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-slate-300">
              <Sparkles className="h-4 w-4 text-cyan-300" />
              Welcome to Verity
            </div>

            <h1 className="text-3xl font-semibold text-white tracking-wide">
              Verity
            </h1>
            <p className="text-sm text-slate-400">Truth, clarity, control</p>
          </div>

          {/* Tabs */}
          {mode !== "forgotPassword" && (
            <div className="mt-7 rounded-2xl border border-white/10 bg-white/5 p-1">
              <div className="grid grid-cols-2">
                {AUTH_TABS.map((item) => {
                  const isActive = mode === item;

                  return (
                    <button
                      key={item}
                      onClick={() => setMode(item)}
                      className={[
                        "rounded-2xl py-2.5 text-sm font-semibold transition active:scale-[0.98]",
                        isActive
                          ? "bg-cyan-300 text-black"
                          : "text-slate-300 hover:bg-white/5 hover:text-white",
                      ].join(" ")}
                    >
                      {item === "signin" ? "Sign In" : "Sign Up"}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Forms */}
          <div className="mt-7">
            {mode === "signin" && (
              <>
                <SignIn />

                <button
                  onClick={() => setMode("forgotPassword")}
                  className="mt-4 block w-full text-center text-sm text-slate-400 hover:text-cyan-200 transition"
                >
                  Forgot password?
                </button>
              </>
            )}

            {mode === "signup" && <SignUp />}

            {mode === "forgotPassword" && (
              <>
                <ForgotPassword />

                <button
                  onClick={() => setMode("signin")}
                  className="mt-4 block w-full text-center text-sm text-slate-400 hover:text-cyan-200 transition"
                >
                  Back to sign in
                </button>
              </>
            )}
          </div>

          {/* Footer */}
          <p className="mt-8 text-center text-xs text-slate-500">
            © 2026 Verity
          </p>
        </div>
      </div>
    </main>
  );
};

export default AuthCard;
