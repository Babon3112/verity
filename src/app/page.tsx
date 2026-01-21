"use client";

import { useSession } from "next-auth/react";
import Navbar from "@/components/navbar";
import Feed from "@/components/home/Feed";
import AuthCard from "@/components/home/AuthCard";
import PostCardSkeletonList from "@/components/skeletons/PostCardSkeletonList";

const Home = () => {
  const { data: session, status } = useSession();

  // ✅ Loading → Skeleton (no spinner)
  if (status === "loading") {
    return (
      <div className="min-h-screen bg-[#0B1112]">
        <NavbarSkeleton />
        <HomeFeedSkeleton />
      </div>
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

/* ================= SKELETONS ================= */

const NavbarSkeleton = () => {
  return (
    <header className="border-b border-white/10 bg-[#0B1112]">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 animate-pulse rounded-2xl bg-white/10" />
          <div>
            <div className="h-4 w-24 animate-pulse rounded bg-white/10" />
            <div className="mt-2 h-3 w-16 animate-pulse rounded bg-white/10" />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="h-10 w-24 animate-pulse rounded-2xl bg-white/10" />
          <div className="h-10 w-10 animate-pulse rounded-2xl bg-white/10" />
        </div>
      </div>
    </header>
  );
};

const HomeFeedSkeleton = () => {
  return (
    <main className="min-h-screen bg-[#0B1112] py-8">
      <div className="mx-auto max-w-xl px-4">
        {/* Header skeleton */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <div className="h-5 w-24 animate-pulse rounded bg-white/10" />
            <div className="mt-2 h-4 w-56 animate-pulse rounded bg-white/10" />
          </div>

          <div className="h-9 w-20 animate-pulse rounded-2xl border border-white/10 bg-white/5" />
        </div>

        {/* Post cards skeleton */}
        <div className="space-y-6">
          <PostCardSkeletonList count={3} />
        </div>
      </div>
    </main>
  );
};
