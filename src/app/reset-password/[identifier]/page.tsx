"use client";

import axios from "axios";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";

const inputClass =
  "w-full rounded-lg border border-neutral-700 bg-neutral-900 px-4 py-3 text-sm " +
  "text-neutral-100 placeholder-neutral-500 outline-none transition " +
  "focus:border-[#00F7FF] focus:ring-2 focus:ring-[#00F7FF]/30";

const ResetPasswordPage = () => {
  const [resetPasswordCode, setResetPasswordCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const params = useParams();
  const router = useRouter();

  const identifier =
    typeof params.identifier === "string"
      ? params.identifier
      : params.identifier?.[0];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      setLoading(true);
      await axios.post("/api/reset-password", {
        identifier,
        resetPasswordCode,
        password,
        confirmPassword,
      });

      router.replace("/");
    } catch (err: any) {
      setError(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#0f1115] px-4">
      <div className="w-full max-w-md rounded-2xl bg-[#151821] border border-white/5 p-8 shadow-xl">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="text-center">
            <h1 className="text-lg font-semibold text-neutral-100">
              Set a new password
            </h1>
            <p className="mt-1 text-sm text-[#B0FFFA]">
              Enter the code we sent and choose a new password
            </p>
          </div>

          <input
            className={inputClass}
            type="text"
            placeholder="Verification code"
            value={resetPasswordCode}
            onChange={(e) => setResetPasswordCode(e.target.value)}
          />

          <input
            className={inputClass}
            type="password"
            placeholder="New password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <input
            className={inputClass}
            type="password"
            placeholder="Confirm new password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />

          {error && (
            <p className="text-sm text-center text-[#FF5FA2]">
              {error}
            </p>
          )}

          <button
            disabled={loading}
            className="
              w-full rounded-lg py-3 text-sm font-medium text-black
              bg-[#00F7FF] 
              transition hover:brightness-110 active:scale-[0.99]
              disabled:bg-neutral-700 disabled:text-neutral-400
              disabled:cursor-not-allowed
            "
          >
            {loading ? "Resetting…" : "Reset password"}
          </button>
        </form>
      </div>
    </main>
  );
};

export default ResetPasswordPage;
