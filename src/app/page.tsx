"use client";

import { useSession } from "next-auth/react";
import Navbar from "@/components/navbar";
import Feed from "@/components/home/Feed";
import AuthCard from "@/components/home/AuthCard";

const Home = () => {
  const { data: session, status } = useSession();

// ✅ Loading
  if (status === "loading") {
    return (
      <main className="min-h-screen bg-[#0B1112] px-4">
        <div className="mx-auto flex min-h-screen max-w-6xl items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="h-10 w-10 animate-spin rounded-full border-2 border-white/10 border-t-cyan-300" />
            <p className="text-sm text-slate-400">Loading…</p>
          </div>
        </div>
      </main>
    );
  }

  // ✅ Logged in → show feed
  if (status === "authenticated" && session) {
    return (
      <>
        <Navbar />
        <Feed />
      </>
    );
  }

  // ✅ Not logged in → show auth UI
  return <AuthCard />;
};

export default Home;
