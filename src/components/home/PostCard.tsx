"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { FeedPost } from "@/components/home/Feed";
import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import MediaCarousel from "@/components/MediaCarousel";

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

type MediaItem = {
  url: string;
  type: "image" | "video";
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
    setLiked(!prevLiked);
    setLikesCount((prev) => (prevLiked ? prev - 1 : prev + 1));

    try {
      setLikeLoading(true);
      await axios.post("/api/posts/like", { postId });
    } catch (err) {
      setLiked(prevLiked);
      setLikesCount((prev) => (prevLiked ? prev + 1 : prev - 1));
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
      } catch {}
    };

    if (postId) getLiked();
  }, [postId]);

  return (
    <>
      <article className="relative overflow-hidden rounded-[28px] border border-white/10 bg-black/30 backdrop-blur-xl shadow-[0_0_0_1px_rgba(255,255,255,0.03)]">
        <div className="relative p-5 sm:p-6">
          {/* HEADER */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.push(`/${post.author.username}`)}
                className="relative h-11 w-11 overflow-hidden rounded-full ring-1 ring-white/10"
              >
                <Image
                  src={
                    post.author.avatar ||
                    "https://res.cloudinary.com/arnabcloudinary/image/upload/v1713427478/EazyBuy/Avatar/no-avatar.png"
                  }
                  alt={post.author.username}
                  fill
                  className="object-cover"
                />
              </button>

              <div>
                <button
                  onClick={() => router.push(`/${post.author.username}`)}
                  className="text-[15px] font-semibold text-white hover:underline"
                >
                  {post.author.fullName}
                </button>

                <div className="text-xs text-slate-400">
                  @{post.author.username} • {formattedDate}
                </div>
              </div>
            </div>

            <button className="rounded-2xl p-2 text-slate-400 hover:text-white">
              <MoreHorizontal className="h-5 w-5" />
            </button>
          </div>

          {/* CONTENT */}
          <div className="mt-4">
            <p className="whitespace-pre-wrap text-sm text-slate-200 mb-4">
              {post.content}
            </p>
          </div>

          {/* MEDIA CAROUSEL */}
          {post.media && post.media.length > 0 && (
            <MediaCarousel
              items={post.media.map((m) => ({
                url: m.url,
                type: m.type,
              }))}
            />
          )}

          {/* ACTIONS */}
          <div className="mt-5 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <button
                onClick={handleLike}
                disabled={likeLoading}
                className={`flex items-center gap-2 rounded-2xl px-3 py-2 text-sm transition ${
                  liked
                    ? "bg-red-500/10 text-red-300"
                    : "bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white"
                }`}
              >
                <Heart
                  className={`h-4 w-4 ${
                    liked ? "fill-red-400 text-red-400" : ""
                  }`}
                />
                Like
                {likesCount > 0 && <span>• {likesCount}</span>}
              </button>

              <button
                onClick={() => router.push(`/post/${postId}`)}
                className="flex items-center gap-2 rounded-2xl bg-white/5 px-3 py-2 text-sm text-slate-300 hover:bg-white/10 hover:text-white"
              >
                <MessageCircle className="h-4 w-4" />
                Comment
              </button>
            </div>

            <button
              onClick={() => handleShare(postId)}
              className="flex items-center gap-2 rounded-2xl bg-white/5 px-3 py-2 text-sm text-slate-300 hover:bg-white/10 hover:text-white"
            >
              <Share2 className="h-4 w-4" />
              Share
            </button>
          </div>

          {copied && (
            <div className="mt-3 text-xs text-cyan-300">
              <Sparkles className="inline h-3 w-3 mr-1" />
              Copied link
            </div>
          )}
        </div>
      </article>
    </>
  );
};

export default PostCard;
