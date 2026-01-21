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
  X,
  Users,
} from "lucide-react";

type LikeUser = {
  _id: string;
  username: string;
  fullName: string;
  avatar: string;
};

type LikeItem = {
  _id: string;
  user: LikeUser;
  createdAt: string;
};

const PostCard = ({ post }: { post: FeedPost }) => {
  const router = useRouter();
  const postId = post._id;

  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(post.likesCount);
  const [likeLoading, setLikeLoading] = useState(false);

  const [copied, setCopied] = useState(false);

  /* ================= LIKES MODAL ================= */
  const [showLikes, setShowLikes] = useState(false);
  const [likesLoading, setLikesLoading] = useState(false);
  const [likesList, setLikesList] = useState<LikeItem[]>([]);
  const [likesPage, setLikesPage] = useState(1);
  const [likesHasMore, setLikesHasMore] = useState(true);

  const formattedDate = useMemo(() => {
    try {
      return new Date(post.createdAt).toLocaleString(undefined, {
        day: "2-digit",
        month: "short",
        year: "numeric",
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

  /* ================= GET ALL LIKES ================= */

  const fetchLikes = async (page: number) => {
    try {
      setLikesLoading(true);

      const res = await axios.get("/api/posts/like/get-likes", {
        params: { postId, page, limit: 10 },
      });

      const newLikes: LikeItem[] = res.data.likes || [];

      setLikesList((prev) => (page === 1 ? newLikes : [...prev, ...newLikes]));
      setLikesPage(page);

      // if returned less than limit => no more
      setLikesHasMore(newLikes.length === 10);
    } catch (err) {
      console.log("GET_ALL_LIKES_ERROR:", err);
      if (page === 1) setLikesList([]);
      setLikesHasMore(false);
    } finally {
      setLikesLoading(false);
    }
  };

  const openLikes = async () => {
    if (likesCount <= 0) return;
    setShowLikes(true);

    // load first page fresh
    setLikesList([]);
    setLikesPage(1);
    setLikesHasMore(true);

    await fetchLikes(1);
  };

  const closeLikes = () => {
    setShowLikes(false);
  };

  return (
    <>
      <article
        className="
          relative overflow-hidden rounded-[28px]
          border border-white/10
          bg-black/30 backdrop-blur-xl
          shadow-[0_0_0_1px_rgba(255,255,255,0.03)]
        "
      >
        {/* subtle glow */}
        <div className="pointer-events-none absolute -top-24 left-10 h-40 w-40 rounded-full bg-cyan-400/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-28 right-0 h-52 w-52 rounded-full bg-fuchsia-400/10 blur-3xl" />

        <div className="relative p-5 sm:p-6">
          {/* HEADER */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.push(`/${post.author.username}`)}
                className="
                  relative h-11 w-11 overflow-hidden rounded-full
                  ring-1 ring-white/10 transition
                  hover:ring-white/20
                  active:scale-[0.98]
                "
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
              className="
                rounded-2xl p-2 text-slate-400 transition
                hover:bg-white/5 hover:text-white
                active:scale-[0.98]
              "
              onClick={() => alert("More options coming soon")}
              aria-label="Post options"
            >
              <MoreHorizontal className="h-5 w-5" />
            </button>
          </div>

          {/* CONTENT */}
          <div className="mt-4">
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-200">
              {post.content}
            </p>
          </div>

          {/* MEDIA */}
          {post.media && (
            <div className="mt-4 overflow-hidden rounded-[22px] border border-white/10 bg-white/5">
              <div className="relative aspect-square w-full bg-black/20">
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
          <div className="mt-5 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              {/* LIKE */}
              <button
                onClick={handleLike}
                disabled={likeLoading}
                className={`
                  relative flex items-center gap-2 rounded-2xl px-3 py-2 text-sm
                  transition active:scale-[0.98]
                  ${
                    liked
                      ? "bg-red-500/10 text-red-300 hover:bg-red-500/15"
                      : "bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white"
                  }
                  ${likeLoading ? "opacity-70 cursor-not-allowed" : ""}
                `}
              >
                {likeLoading && (
                  <span className="absolute inset-0 rounded-2xl bg-white/10 animate-pulse" />
                )}

                <span className="relative inline-flex items-center gap-2">
                  <Heart
                    className={`h-4 w-4 ${
                      liked ? "fill-red-400 text-red-400" : ""
                    }`}
                  />
                  <span className="font-medium">Like</span>

                  {likesCount > 0 && (
                    <>
                      <span className="text-xs text-slate-400">•</span>

                      {/* clickable likesCount */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          openLikes();
                        }}
                        className="text-sm tabular-nums text-slate-200 hover:underline"
                      >
                        {likesCount}
                      </button>
                    </>
                  )}
                </span>
              </button>

              {/* COMMENT */}
              <button
                onClick={() => router.push(`/post/${postId}`)}
                className="
                  flex items-center gap-2 rounded-2xl
                  bg-white/5 px-3 py-2 text-sm text-slate-300
                  transition hover:bg-white/10 hover:text-white
                  active:scale-[0.98]
                "
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
                className="
                  flex items-center gap-2 rounded-2xl
                  bg-white/5 px-3 py-2 text-sm text-slate-300
                  transition hover:bg-white/10 hover:text-white
                  active:scale-[0.98]
                "
              >
                <Share2 className="h-4 w-4" />
                <span className="font-medium">Share</span>
              </button>

              {/* mini toast */}
              {copied && (
                <div className="absolute w-28 right-0 -top-11 flex items-center gap-2 rounded-2xl border border-white/10 bg-black/70 px-3 py-2 text-xs text-slate-200 shadow-lg backdrop-blur">
                  <Sparkles className="h-3.5 w-3.5 text-cyan-300" />
                  Copied link
                </div>
              )}
            </div>
          </div>
        </div>
      </article>

      {/* ================= LIKES MODAL ================= */}
      {showLikes && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm"
          onClick={closeLikes}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="
              w-full max-w-md overflow-hidden rounded-[28px]
              border border-white/10 bg-black/70 backdrop-blur-xl
              shadow-[0_12px_60px_-25px_rgba(0,0,0,0.9)]
            "
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
              <div className="flex items-center gap-2">
                <div className="inline-flex h-9 w-9 items-center justify-center rounded-2xl border border-white/10 bg-white/5">
                  <Users className="h-4 w-4 text-cyan-300" />
                </div>

                <div>
                  <p className="text-sm font-semibold text-white">Likes</p>
                  <p className="text-xs text-slate-500">
                    {likesCount} people liked this
                  </p>
                </div>
              </div>

              <button
                onClick={closeLikes}
                className="rounded-2xl p-2 text-slate-400 transition hover:bg-white/5 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Body */}
            <div className="max-h-105 overflow-y-auto px-5 py-5">
              {likesLoading && likesList.length === 0 && <LikesListSkeleton />}

              {!likesLoading && likesList.length === 0 && (
                <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-center">
                  <p className="text-sm text-slate-300">No likes found</p>
                  <p className="mt-1 text-xs text-slate-500">
                    This post has no likes yet.
                  </p>
                </div>
              )}

              {likesList.length > 0 && (
                <div className="space-y-3">
                  {likesList.map((like) => (
                    <button
                      key={like._id}
                      onClick={() => {
                        closeLikes();
                        router.push(`/${like.user.username}`);
                      }}
                      className="
                        flex w-full items-center justify-between gap-3
                        rounded-2xl border border-white/10 bg-white/5 px-4 py-3
                        text-left transition hover:bg-white/10 active:scale-[0.99]
                      "
                    >
                      <div className="flex items-center gap-3">
                        <div className="relative h-10 w-10 overflow-hidden rounded-full ring-1 ring-white/10">
                          <Image
                            src={like.user.avatar || "/avatar-placeholder.png"}
                            alt={like.user.username}
                            fill
                            className="object-cover"
                          />
                        </div>

                        <div className="leading-tight">
                          <p className="text-sm font-semibold text-white">
                            {like.user.fullName}
                          </p>
                          <p className="text-xs text-slate-500">
                            @{like.user.username}
                          </p>
                        </div>
                      </div>

                      <span className="text-xs text-slate-500">View</span>
                    </button>
                  ))}

                  {/* Load more */}
                  {likesHasMore && (
                    <button
                      onClick={() => fetchLikes(likesPage + 1)}
                      disabled={likesLoading}
                      className="
                        relative mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3
                        text-sm text-slate-200 transition hover:bg-white/10
                        disabled:opacity-60 disabled:cursor-not-allowed
                      "
                    >
                      {likesLoading && (
                        <span className="absolute inset-0 rounded-2xl bg-white/10 animate-pulse" />
                      )}
                      <span className="relative">
                        {likesLoading ? "Loading…" : "Load more"}
                      </span>
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PostCard;

/* ================= SKELETON ================= */

const LikesListSkeleton = () => {
  return (
    <div className="space-y-3">
      {Array.from({ length: 6 }).map((_, idx) => (
        <div
          key={idx}
          className="animate-pulse flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3"
        >
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-white/10" />
            <div>
              <div className="h-4 w-32 rounded bg-white/10" />
              <div className="mt-2 h-3 w-24 rounded bg-white/10" />
            </div>
          </div>

          <div className="h-3 w-10 rounded bg-white/10" />
        </div>
      ))}
    </div>
  );
};
