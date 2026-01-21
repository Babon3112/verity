"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import PostCard from "@/components/home/PostCard";
import { Sparkles, Newspaper } from "lucide-react";
import PostCardSkeletonList from "@/components/skeletons/PostCardSkeletonList";

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
    <main className="relative min-h-screen bg-[#070B0C] py-10">
      {/* Background glow */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-36 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-cyan-400/10 blur-3xl" />
        <div className="absolute top-44 -right-27.5 h-80 w-80 rounded-full bg-fuchsia-400/10 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-xl px-4">
        {/* Header Card */}
        <div className="mb-6 rounded-[28px] border border-white/10 bg-black/30 p-6 backdrop-blur-xl shadow-[0_0_0_1px_rgba(255,255,255,0.03)]">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-white tracking-tight">
                Home
              </h2>
              <p className="mt-1 text-sm text-slate-400">
                Fresh posts from people you follow.
              </p>
            </div>

            <div className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-slate-200">
              <Sparkles className="h-4 w-4 text-cyan-300" />
              Feed
            </div>
          </div>
        </div>

        {/* Feed Body */}
        <div className="space-y-6">
          {loadingFeed && <PostCardSkeletonList count={3} />}

          {!loadingFeed && posts.length === 0 && (
            <div className="rounded-[28px] border border-white/10 bg-black/30 p-10 text-center backdrop-blur-xl shadow-[0_0_0_1px_rgba(255,255,255,0.03)]">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/5">
                <Newspaper className="h-6 w-6 text-slate-300" />
              </div>

              <p className="text-sm font-medium text-slate-200">
                No posts yet
              </p>
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
