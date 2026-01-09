"use client";

import axios from "axios";
import { useSession } from "next-auth/react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const inputClass =
  "w-full rounded-lg border border-neutral-700 bg-neutral-900 px-4 py-3 text-sm " +
  "text-neutral-100 placeholder-neutral-500 outline-none transition " +
  "focus:border-[#00F7FF] focus:ring-2 focus:ring-[#00F7FF]/30";

const VerifyPage = () => {
  const { data: session } = useSession();
  const [verifyCode, setVerifyCode] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const params = useParams();

  const verify = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");

    try {
      setLoading(true);
      const res = await axios.post("/api/verify", {
        username: params.username,
        verifyCode,
      });

      setMessage(res.data.message);
      router.replace("/");
    } catch (err: any) {
      setMessage(err.response?.data?.message || "Verification failed");
    } finally {
      setLoading(false);
    }
  };

useEffect(() => {
  if (session) router.replace("/");
}, [session]);


  return (
    <main className="min-h-screen flex items-center justify-center bg-[#0f1115] px-4">
      <div className="w-full max-w-md rounded-2xl bg-[#151821] border border-white/5 p-8 shadow-xl">
        <form onSubmit={verify} className="space-y-4">
          <div className="text-center">
            <h1 className="text-lg font-semibold text-neutral-100">
              Verify your account
            </h1>
            <p className="mt-1 text-sm text-[#B0FFFA]">
              Enter the code sent to your email
            </p>
          </div>

          <input
            className={inputClass}
            type="text"
            value={verifyCode}
            onChange={(e) => setVerifyCode(e.target.value)}
            placeholder="Verification code"
          />

          {message && (
            <p className="text-sm text-center text-[#B0FFFA]">
              {message}
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
            {loading ? "Verifying…" : "Verify account"}
          </button>
        </form>
      </div>
    </main>
  );
};

export default VerifyPage;
