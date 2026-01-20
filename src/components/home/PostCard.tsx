"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { FeedPost } from "@/components/home/Feed";
import { useEffect, useMemo, useState } from "react";
import axios from "axios";

// icons
import {
  Heart,
  MessageCircle,
  Share2,
  MoreHorizontal,
  Sparkles,
} from "lucide-react";

const PostCard = ({ post }: { post: FeedPost }) => {
  const router = useRouter();
  const postId = post._id;

  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(post.likesCount);
  const [likeLoading, setLikeLoading] = useState(false);

  const [copied, setCopied] = useState(false);

  const formattedDate = useMemo(() => {
    try {
      return new Date(post.createdAt).toLocaleString(undefined, {
        day: "2-digit",
        month: "short",
        year: "numeric",
        // hour: "2-digit",
        // minute: "2-digit",
      });
    } catch {
      return "";
    }
  }, [post.createdAt]);

  const handleShare = async (postId: string) => {
    try {
      const url = `${window.location.origin}/post/${postId}`;
      await navigator.clipboard.writeText(url);

      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch (err) {
      console.log(err);
    }
  };

  const handleLike = async () => {
    if (likeLoading) return;

    const prevLiked = liked;

    // instant UI update
    setLiked(!prevLiked);
    setLikesCount((prev) => (prevLiked ? prev - 1 : prev + 1));

    try {
      setLikeLoading(true);
      await axios.post("/api/posts/like", { postId });
    } catch (err) {
      // rollback
      setLiked(prevLiked);
      setLikesCount((prev) => (prevLiked ? prev + 1 : prev - 1));
      console.log(err);
    } finally {
      setLikeLoading(false);
    }
  };

  useEffect(() => {
    const getLiked = async () => {
      try {
        const response = await axios.get("/api/posts/like/get-like-status", {
          params: { postId },
        });

        setLiked(response.data.liked);
      } catch (err) {
        console.log("Error fetching like status:", err);
      }
    };

    if (postId) getLiked();
  }, [postId]);

  return (
    <article className="group relative overflow-hidden rounded-3xl border border-white/10 bg-[#0B1112] shadow-[0_0_0_1px_rgba(255,255,255,0.04)]">
      {/* Soft glow */}
      <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
        <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-emerald-400/10 blur-3xl" />
      </div>

      <div className="relative p-5">
        {/* HEADER */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push(`/${post.author.username}`)}
              className="relative h-11 w-11 overflow-hidden rounded-full ring-1 ring-white/10 transition hover:ring-white/20"
            >
              <Image
                src={post.author.avatar || "/avatar-placeholder.png"}
                alt={post.author.username}
                fill
                className="object-cover"
              />
            </button>

            <div className="leading-tight">
              <button
                onClick={() => router.push(`/${post.author.username}`)}
                className="text-[15px] font-semibold text-white hover:underline"
              >
                {post.author.fullName}
              </button>

              <div className="flex items-center gap-2 text-xs text-slate-400">
                <span>@{post.author.username}</span>
                <span className="text-white/20">•</span>
                <span className="text-slate-500">{formattedDate}</span>
              </div>
            </div>
          </div>

          {/* menu */}
          <button
            className="rounded-xl p-2 text-slate-400 transition hover:bg-white/5 hover:text-white"
            onClick={() => alert("More options coming soon")}
            aria-label="Post options"
          >
            <MoreHorizontal className="h-5 w-5" />
          </button>
        </div>

        {/* CONTENT */}
        <div className="mt-4">
          <p className="text-sm leading-relaxed text-slate-200 whitespace-pre-wrap">
            {post.content}
          </p>
        </div>

        {/* MEDIA */}
        {post.media && (
          <div className="mt-4 overflow-hidden rounded-2xl border border-white/10 bg-white/2">
            <div className="relative aspect-square w-full bg-black/30">
              {post.media.type === "image" ? (
                <Image
                  src={post.media.url}
                  alt="post media"
                  fill
                  className="object-contain"
                />
              ) : (
                <video
                  src={post.media.url}
                  controls
                  className="absolute inset-0 h-full w-full object-contain"
                />
              )}
            </div>
          </div>
        )}

        {/* ACTIONS */}
        <div className="mt-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {/* LIKE */}
            <button
              onClick={handleLike}
              disabled={likeLoading}
              className={`flex items-center gap-2 rounded-2xl px-3 py-2 text-sm transition active:scale-[0.98]
    ${
      liked
        ? "bg-red-500/10 text-red-400 hover:bg-red-500/15"
        : "bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white"
    }
    ${likeLoading ? "opacity-60 cursor-not-allowed" : ""}
  `}
            >
              <Heart
                className={`h-4 w-4 ${liked ? "fill-red-400 text-red-400" : ""}`}
              />
              <span className="font-medium">Like</span>

              {likesCount > 0 && (
                <>
                  <span className="text-xs text-slate-400">•</span>
                  <span className="text-sm tabular-nums">{likesCount}</span>
                </>
              )}
            </button>

            {/* COMMENT */}
            <button
              onClick={() => alert("Comments coming soon")}
              className="flex items-center gap-2 rounded-2xl bg-white/5 px-3 py-2 text-sm text-slate-300 transition hover:bg-white/10 hover:text-white active:scale-[0.98]"
            >
              <MessageCircle className="h-4 w-4" />
              <span className="font-medium">Comment</span>

              {post.commentsCount > 0 && (
                <>
                  <span className="text-xs text-slate-400">•</span>
                  <span className="text-sm tabular-nums">
                    {post.commentsCount}
                  </span>
                </>
              )}
            </button>
          </div>

          {/* SHARE */}
          <div className="relative">
            <button
              onClick={() => handleShare(postId)}
              className="flex items-center gap-2 rounded-2xl bg-white/5 px-3 py-2 text-sm text-slate-300 transition hover:bg-white/10 hover:text-white active:scale-[0.98]"
            >
              <Share2 className="h-4 w-4" />
              <span className="font-medium">Share</span>
            </button>

            {/* mini toast */}
            {copied && (
              <div className="absolute right-0 -top-11 flex items-center gap-2 rounded-2xl border border-white/10 bg-black/70 px-3 py-2 text-xs text-slate-200 shadow-lg backdrop-blur">
                <Sparkles className="h-3.5 w-3.5 text-cyan-300" />
                Copied link
              </div>
            )}
          </div>
        </div>
      </div>
    </article>
  );
};

export default PostCard;
