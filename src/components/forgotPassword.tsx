"use client";

import axios from "axios";
import { useRouter } from "next/navigation";
import { useState } from "react";

const inputClass =
  "w-full rounded-lg border border-neutral-700 bg-neutral-900 px-4 py-3 text-sm " +
  "text-neutral-100 placeholder-neutral-500 outline-none transition " +
  "focus:border-[#00F7FF] focus:ring-2 focus:ring-[#00F7FF]/30";

const ForgotPassword = () => {
  const [identifier, setIdentifier] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const baseUrl = `${window.location.protocol}//${window.location.host}`;
  const resetPasswordUrl = `${baseUrl}/reset-password/${identifier}`;

  const handleSubmit = async () => {
    if (!identifier) return;

    try {
      setLoading(true);
      await axios.post("/api/forgot-password", {
        identifier,
        resetPasswordUrl,
      });
      router.replace(`/reset-password/${identifier}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="mt-4 text-center">
        <h1 className="text-lg font-semibold text-neutral-100">
          Reset your password
        </h1>
        <p className="mt-1 text-sm text-[#B0FFFA]">
          We’ll send you a secure reset link
        </p>
      </div>

      <input
        className={inputClass}
        placeholder="Email or username"
        value={identifier}
        onChange={(e) => setIdentifier(e.target.value)}
      />

      <button
        disabled={loading}
        onClick={handleSubmit}
        className="
          w-full rounded-lg py-3 text-sm font-medium text-black
          bg-[#00F7FF] brightness-75
          transition hover:brightness-110 active:scale-[0.99]
          disabled:from-neutral-700 disabled:to-neutral-700
          disabled:text-neutral-400 disabled:cursor-not-allowed
        "
      >
        {loading ? "Sending…" : "Send reset link"}
      </button>
    </div>
  );
};

export default ForgotPassword;
