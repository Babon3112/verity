"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { FeedPost } from "@/components/home/Feed";
import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import MediaCarousel from "@/components/MediaCarousel";
import { useSession } from "next-auth/react";

import {
  Heart,
  MessageCircle,
  Share2,
  MoreHorizontal,
  Sparkles,
  Globe,
  Lock,
  Users,
  Bookmark,
  Flag,
  FileText,
} from "lucide-react";

interface PostCardProps {
  post: FeedPost;
  onDeleteSuccess?: (postId: string) => void;
}

const PostCard = ({ post, onDeleteSuccess }: PostCardProps) => {
  const router = useRouter();
  const { data: session } = useSession();

  const postId = post._id;
  const isOwner = session?.user?._id === post.author._id;

  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(post.likesCount);
  const [likeLoading, setLikeLoading] = useState(false);

  const [copied, setCopied] = useState(false);
  const [copiedText, setCopiedText] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

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

  const visibilityIcon = useMemo(() => {
    const baseClass = "h-4 w-4 text-slate-400";

    switch (post.visibility) {
      case "private":
        return <Lock className={baseClass} />;
      case "followers":
        return <Users className={baseClass} />;
      default:
        return <Globe className={baseClass} />;
    }
  }, [post.visibility]);

  const handleShare = async () => {
    try {
      const url = `${window.location.origin}/post/${postId}`;
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {}
  };

  const handleCopyText = async () => {
    try {
      await navigator.clipboard.writeText(post.content);
      setCopiedText(true);
      setTimeout(() => setCopiedText(false), 1200);
      setShowMenu(false);
    } catch {}
  };

  const handleLike = async () => {
    if (likeLoading) return;

    const prevLiked = liked;
    setLiked(!prevLiked);
    setLikesCount((prev) => (prevLiked ? prev - 1 : prev + 1));

    try {
      setLikeLoading(true);
      await axios.post("/api/posts/like", { postId });
    } catch {
      setLiked(prevLiked);
      setLikesCount((prev) => (prevLiked ? prev + 1 : prev - 1));
    } finally {
      setLikeLoading(false);
    }
  };

  useEffect(() => {
    const getLiked = async () => {
      try {
        const response = await axios.get(
          "/api/posts/like/get-like-status",
          { params: { postId } }
        );
        setLiked(response.data.liked);
      } catch {}
    };

    if (postId) getLiked();
  }, [postId]);

  const handleDelete = async () => {
    const confirmDelete = confirm("Delete this post?");
    if (!confirmDelete) return;

    try {
      await axios.delete("/api/posts/delete", {
        data: { postId },
      });

      if (onDeleteSuccess) {
        onDeleteSuccess(postId);
      } else {
        router.push("/");
      }
    } catch {
      alert("Failed to delete post");
    }
  };

  return (
    <article className="group relative overflow-hidden rounded-3xl border border-white/10 bg-linear-to-br from-white/4 to-white/2 backdrop-blur-2xl shadow-[0_10px_40px_rgba(0,0,0,0.4)] transition duration-500 hover:border-white/20 hover:shadow-[0_20px_60px_rgba(0,0,0,0.6)]">
      <div className="relative p-6">

        {/* HEADER */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push(`/${post.author.username}`)}
              className="relative h-12 w-12 overflow-hidden rounded-full ring-1 ring-white/15 transition group-hover:ring-white/30"
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
              <div className="flex items-center gap-2">
                <button
                  onClick={() => router.push(`/${post.author.username}`)}
                  className="text-[15px] font-semibold text-white hover:underline"
                >
                  {post.author.fullName}
                </button>
                {visibilityIcon}
              </div>

              <div className="text-xs text-slate-400 tracking-wide">
                @{post.author.username} · {formattedDate}
              </div>
            </div>
          </div>

          <div className="relative">
            <button
              onClick={() => setShowMenu((prev) => !prev)}
              className="rounded-xl p-2 text-slate-400 hover:bg-white/10 hover:text-white transition"
            >
              <MoreHorizontal className="h-5 w-5" />
            </button>

            {showMenu && (
              <div className="absolute right-0 mt-2 w-48 rounded-2xl border border-white/10 bg-black/95 backdrop-blur-xl shadow-2xl p-2 z-50 space-y-1">
                {isOwner && (
                  <button
                    onClick={handleDelete}
                    className="w-full text-left rounded-xl px-3 py-2 text-sm text-red-400 hover:bg-red-500/10"
                  >
                    Delete Post
                  </button>
                )}

                {!isOwner && (
                  <button
                    className="w-full flex items-center gap-2 rounded-xl px-3 py-2 text-sm hover:bg-white/10"
                  >
                    <Flag className="h-4 w-4" />
                    Report Post
                  </button>
                )}

                <button
                  onClick={handleCopyText}
                  className="w-full flex items-center gap-2 rounded-xl px-3 py-2 text-sm hover:bg-white/10"
                >
                  <FileText className="h-4 w-4" />
                  Copy Text
                </button>
                
              </div>
            )}
          </div>
        </div>

        {/* CONTENT */}
        <div className="mt-5">
          <p className="whitespace-pre-wrap text-[15px] leading-relaxed text-slate-200">
            {post.content}
          </p>
        </div>

        {/* MEDIA */}
        {post.media && post.media.length > 0 && (
          <div className="mt-5">
            <MediaCarousel
              items={post.media.map((m) => ({
                url: m.url,
                type: m.type,
              }))}
            />
          </div>
        )}

        {/* ACTIONS */}
        <div className="mt-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={handleLike}
              disabled={likeLoading}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm transition-all duration-300 ${
                liked
                  ? "bg-red-500/10 text-red-400 shadow-inner"
                  : "bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white"
              }`}
            >
              <Heart
                className={`h-4 w-4 transition ${
                  liked ? "fill-red-400 scale-110" : ""
                }`}
              />
              {likesCount > 0 ? likesCount : "Like"}
            </button>

            <button
              onClick={() => router.push(`/post/${postId}`)}
              className="flex items-center gap-2 rounded-xl bg-white/5 px-4 py-2 text-sm text-slate-300 hover:bg-white/10 hover:text-white transition"
            >
              <MessageCircle className="h-4 w-4" />
              Comment
            </button>

            <button
              className="flex items-center gap-2 rounded-xl bg-white/5 px-4 py-2 text-sm text-slate-300 hover:bg-white/10 hover:text-white transition"
            >
              <Bookmark className="h-4 w-4" />
              Save
            </button>
          </div>

          <button
            onClick={handleShare}
            className="flex items-center gap-2 rounded-xl bg-white/5 px-4 py-2 text-sm text-slate-300 hover:bg-white/10 hover:text-white transition"
          >
            <Share2 className="h-4 w-4" />
            Share
          </button>
        </div>

        {copied && (
          <div className="mt-4 text-xs text-cyan-300 flex items-center gap-1">
            <Sparkles className="h-3 w-3" />
            Link copied
          </div>
        )}

        {copiedText && (
          <div className="mt-4 text-xs text-emerald-300 flex items-center gap-1">
            <Sparkles className="h-3 w-3" />
            Text copied
          </div>
        )}
      </div>
    </article>
  );
};

export default PostCard;
