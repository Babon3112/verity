"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";

const inputClass =
  "w-full rounded-lg border border-neutral-700 bg-neutral-900 px-4 py-3 text-sm " +
  "text-neutral-100 placeholder-neutral-500 outline-none transition " +
  "focus:border-[#00F7FF] focus:ring-2 focus:ring-[#00F7FF]/30";

const SignIn = () => {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!identifier || !password) {
      setError("All fields are required");
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
      <div className="mt-4 text-center">
        <h1 className="text-lg font-semibold text-neutral-100">
          Welcome back
        </h1>
        <p className="mt-1 text-sm text-[#B0FFFA]">
          Sign in to your account
        </p>
      </div>

      <input
        className={inputClass}
        placeholder="Email or username"
        value={identifier}
        onChange={(e) => setIdentifier(e.target.value)}
      />

      <input
        className={inputClass}
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      {error && (
        <p className="text-sm text-[#FF5FA2] text-center">
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
        {loading ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
};

export default SignIn;
