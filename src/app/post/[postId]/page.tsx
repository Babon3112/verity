"use client";

import { useParams } from "next/navigation";
import Navbar from "@/components/navbar";
import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import PostCard from "@/components/home/PostCard";
import Comments from "@/components/comment";
import PostCardSkeleton from "@/components/skeletons/PostCardSkeleton";
import { Sparkles, MessageCircleOff } from "lucide-react";

export default function PostDetailsPage() {
  const params = useParams();

  const postId = useMemo(() => {
    const id = params?.postId;
    if (!id || Array.isArray(id)) return null;
    return id;
  }, [params]);

  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!postId) return;

    const fetchPost = async () => {
      try {
        setLoading(true);
        const res = await axios.get("/api/posts/get-single", {
          params: { postId },
        });
        setPost(res.data.post);
      } catch (err) {
        console.log(err);
        setPost(null);
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [postId]);

  return (
    <div className="min-h-screen bg-[#070B0C] text-white">
      <Navbar />

      <main className="relative px-4 py-10">
        {/* Background glow */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-32 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-cyan-400/10 blur-3xl" />
          <div className="absolute top-40 -right-20 h-72 w-72 rounded-full bg-fuchsia-400/10 blur-3xl" />
        </div>

        <div className="relative mx-auto w-full max-w-2xl space-y-6">
          {/* Header */}
          <div className="rounded-[28px] border border-white/10 bg-black/30 p-6 backdrop-blur-xl shadow-[0_0_0_1px_rgba(255,255,255,0.03)]">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5">
                <Sparkles className="h-5 w-5 text-cyan-200" />
              </div>

              <div className="flex-1">
                <h1 className="text-lg font-semibold tracking-tight text-white">
                  Post details
                </h1>
                <p className="text-sm text-slate-400">
                  Read the post and join the conversation.
                </p>
              </div>
            </div>
          </div>

          {/* Loading */}
          {loading && (
            <div className="space-y-6">
              <CardShell>
                <PostCardSkeleton />
              </CardShell>

              <CommentsSkeletonCard />
            </div>
          )}

          {/* Not Found */}
          {!loading && !post && (
            <div className="rounded-[28px] border border-white/10 bg-black/30 p-10 text-center backdrop-blur-xl shadow-[0_0_0_1px_rgba(255,255,255,0.03)]">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/5">
                <MessageCircleOff className="h-6 w-6 text-slate-300" />
              </div>

              <h2 className="mt-4 text-xl font-semibold tracking-tight text-white">
                Post not found
              </h2>
              <p className="mt-2 text-sm text-slate-400">
                This post may have been deleted or the link is incorrect.
              </p>
            </div>
          )}

          {/* Post + Comments */}
          {!loading && post && postId && (
            <div className="space-y-6">
              <CardShell>
                <PostCard post={post} />
              </CardShell>

              <CardShell>
                <Comments postId={postId} initialCount={post.commentsCount || 0} />
              </CardShell>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

/* ================= SMALL WRAPPER ================= */

const CardShell = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="overflow-hidden rounded-[28px] border border-white/10 bg-black/30 backdrop-blur-xl shadow-[0_0_0_1px_rgba(255,255,255,0.03)]">
      {children}
    </div>
  );
};

/* ================= SKELETONS ================= */

const CommentsSkeletonCard = () => {
  return (
    <section className="animate-pulse overflow-hidden rounded-[28px] border border-white/10 bg-black/30 backdrop-blur-xl shadow-[0_0_0_1px_rgba(255,255,255,0.03)]">
      <div className="flex items-center justify-between gap-3 border-b border-white/10 px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-2xl bg-white/10" />
          <div>
            <div className="h-4 w-28 rounded bg-white/10" />
            <div className="mt-2 h-3 w-40 rounded bg-white/10" />
          </div>
        </div>
        <div className="h-9 w-20 rounded-2xl bg-white/10" />
      </div>

      <div className="px-5 py-4">
        <div className="h-12 w-full rounded-2xl bg-white/10" />
        <div className="mt-3 flex justify-between">
          <div className="h-3 w-44 rounded bg-white/10" />
          <div className="h-3 w-16 rounded bg-white/10" />
        </div>
      </div>

      <div className="space-y-4 border-t border-white/10 px-5 py-5">
        {Array.from({ length: 3 }).map((_, idx) => (
          <div
            key={idx}
            className="rounded-3xl border border-white/10 bg-white/5 p-4"
          >
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-2xl bg-white/10" />
              <div className="flex-1">
                <div className="h-4 w-40 rounded bg-white/10" />
                <div className="mt-2 h-3 w-64 rounded bg-white/10" />
                <div className="mt-2 h-3 w-52 rounded bg-white/10" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
