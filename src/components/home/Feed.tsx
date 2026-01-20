"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import PostCard from "@/components/home/PostCard";
import { Sparkles } from "lucide-react";

export interface FeedPost {
  _id: string;
  content: string;
  createdAt: string;
  likesCount: number;
  commentsCount: number;
  author: {
    username: string;
    fullName: string;
    avatar: string;
  };
  media?: {
    url: string;
    type: "image" | "video";
  };
}

const Feed = () => {
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [loadingFeed, setLoadingFeed] = useState(true);

  useEffect(() => {
    const fetchFeed = async () => {
      try {
        const res = await axios.get("/api/feed");
        setPosts(res.data.posts || []);
      } catch (err) {
        console.log(err);
        setPosts([]);
      } finally {
        setLoadingFeed(false);
      }
    };

    fetchFeed();
  }, []);

  return (
    <main className="min-h-screen bg-[#0B1112] py-8">
      <div className="mx-auto max-w-xl px-4">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-white">Home</h2>
            <p className="mt-1 text-sm text-slate-400">
              Fresh posts from people you follow.
            </p>
          </div>

          <div className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-slate-300">
            <Sparkles className="h-4 w-4 text-cyan-300" />
            Feed
          </div>
        </div>

        {/* Feed Body */}
        <div className="space-y-6">
          {loadingFeed && (
            <>
              <FeedSkeleton />
              <FeedSkeleton />
              <FeedSkeleton />
            </>
          )}

          {!loadingFeed && posts.length === 0 && (
            <div className="rounded-3xl border border-white/10 bg-white/5 p-10 text-center">
              <p className="text-sm text-slate-200">No posts yet</p>
              <p className="mt-2 text-xs text-slate-500">
                Follow people or create your first post to see updates here.
              </p>
            </div>
          )}

          {!loadingFeed &&
            posts.length > 0 &&
            posts.map((post) => <PostCard key={post._id} post={post} />)}
        </div>
      </div>
    </main>
  );
};

export default Feed;

/* ================= SKELETON ================= */

const FeedSkeleton = () => {
  return (
    <article className="group relative overflow-hidden rounded-3xl border border-white/10 bg-[#0B1112] shadow-[0_0_0_1px_rgba(255,255,255,0.04)] animate-pulse">
      {/* Soft glow (same as PostCard) */}
      <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
        <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-emerald-400/10 blur-3xl" />
      </div>

      <div className="relative p-5">
        {/* HEADER */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            {/* avatar */}
            <div className="relative h-11 w-11 overflow-hidden rounded-full ring-1 ring-white/10 bg-white/10" />

            {/* name + username */}
            <div className="leading-tight flex-1">
              <div className="h-4 w-32 rounded bg-white/10" />
              <div className="mt-2 h-3 w-28 rounded bg-white/10" />
            </div>
          </div>

          {/* menu icon placeholder */}
          <div className="h-9 w-9 rounded-xl bg-white/5" />
        </div>

        {/* CONTENT */}
        <div className="mt-4 space-y-2">
          <div className="h-3 w-full rounded bg-white/10" />
          <div className="h-3 w-[92%] rounded bg-white/10" />
          <div className="h-3 w-[70%] rounded bg-white/10" />
        </div>

        {/* MEDIA */}
        <div className="mt-4 overflow-hidden rounded-2xl border border-white/10 bg-white/2">
          <div className="relative aspect-square w-full bg-white/10" />
        </div>

        {/* ACTIONS */}
        <div className="mt-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {/* Like button skeleton */}
            <div className="h-10 w-28 rounded-2xl bg-white/10" />

            {/* Comment button skeleton */}
            <div className="h-10 w-36 rounded-2xl bg-white/10" />
          </div>

          {/* Share button skeleton */}
          <div className="h-10 w-28 rounded-2xl bg-white/10" />
        </div>
      </div>
    </article>
  );
};

