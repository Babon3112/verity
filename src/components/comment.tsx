"use client";

import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import Image from "next/image";
import { useSession } from "next-auth/react";
import {
  MessageCircle,
  SendHorizonal,
  CornerDownRight,
  Trash2,
  RefreshCcw,
  X,
} from "lucide-react";

type CommentAuthor = {
  _id: string;
  username: string;
  fullName: string;
  avatar: string;
};

export type CommentItem = {
  _id: string;
  content: string;
  createdAt: string;
  author: CommentAuthor;
  parentComment?: string | null;
  replies?: CommentItem[];
};

const inputWrap =
  "flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 transition focus-within:border-cyan-300/40 focus-within:bg-white/[0.07]";

const inputField =
  "w-full bg-transparent text-sm text-white placeholder:text-slate-500 outline-none";

const Comments = ({
  postId,
  initialCount = 0,
  onCountChange,
}: {
  postId: string;
  initialCount?: number;
  onCountChange?: (newCount: number) => void;
}) => {
  const { data: session } = useSession();

  const sessionUserId =
    session?.user && "_id" in session.user
      ? (session.user as { _id: string })._id
      : null;

  const [comments, setComments] = useState<CommentItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [content, setContent] = useState("");
  const [sending, setSending] = useState(false);

  const [replyTo, setReplyTo] = useState<{
    commentId: string;
    username: string;
  } | null>(null);

  const [deleteLoadingId, setDeleteLoadingId] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const totalCount = useMemo(() => {
    const countAll = (items: CommentItem[]): number => {
      let count = 0;
      for (const c of items) {
        count += 1;
        if (c.replies?.length) count += countAll(c.replies);
      }
      return count;
    };
    return countAll(comments);
  }, [comments]);

  useEffect(() => {
    if (typeof onCountChange === "function") onCountChange(totalCount);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [totalCount]);

  const fetchComments = async () => {
    try {
      setRefreshing(true);
      setLoading(true);

      const res = await axios.get("/api/posts/comments/", {
        params: { postId },
      });
      setComments(res.data.comments || []);
    } catch (err) {
      console.log("COMMENTS_FETCH_ERROR:", err);
      setComments([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (!postId) return;
    fetchComments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [postId]);

  const handleSend = async () => {
    if (sending) return;

    const text = content.trim();
    if (!text) return;

    try {
      setSending(true);

      await axios.post("/api/posts/comments/create", {
        postId,
        content: text,
        parentComment: replyTo?.commentId || null,
      });

      setContent("");
      setReplyTo(null);

      await fetchComments();
    } catch (err) {
      console.log("COMMENTS_CREATE_ERROR:", err);
      alert("Failed to add comment. Try again.");
    } finally {
      setSending(false);
    }
  };

  const handleDelete = async (commentId: string) => {
    if (!commentId) return;
    if (deleteLoadingId) return;

    const ok = confirm("Delete this comment?");
    if (!ok) return;

    try {
      setDeleteLoadingId(commentId);

      await axios.delete("/api/posts/comments/delete", {
        data: { commentId },
      });

      await fetchComments();
    } catch (err) {
      console.log("COMMENTS_DELETE_ERROR:", err);
      alert("Failed to delete comment.");
    } finally {
      setDeleteLoadingId(null);
    }
  };

  return (
    <section
      className="
        relative overflow-hidden rounded-[28px]
        border border-white/10 bg-black/30 backdrop-blur-xl
        shadow-[0_0_0_1px_rgba(255,255,255,0.03)]
      "
    >
      {/* soft glow */}
      <div className="pointer-events-none absolute -top-24 left-10 h-40 w-40 rounded-full bg-cyan-400/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-28 right-0 h-52 w-52 rounded-full bg-fuchsia-400/10 blur-3xl" />

      {/* HEADER */}
      <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
        <div className="flex items-center gap-2">
          <div className="inline-flex h-9 w-9 items-center justify-center rounded-2xl border border-white/10 bg-white/5">
            <MessageCircle className="h-4 w-4 text-cyan-300" />
          </div>

          <div className="leading-tight">
            <p className="text-sm font-semibold text-white">Comments</p>
            <p className="text-xs text-slate-500">
              {loading ? "Loading…" : `${totalCount || initialCount} total`}
            </p>
          </div>
        </div>

        <button
          onClick={fetchComments}
          disabled={refreshing}
          className="
            inline-flex items-center gap-2 rounded-2xl
            border border-white/10 bg-white/5 px-3 py-2 text-xs text-slate-200
            transition hover:bg-white/10
            disabled:opacity-60 disabled:cursor-not-allowed
            active:scale-[0.98]
          "
        >
          <RefreshCcw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {/* INPUT */}
      <div className="px-5 py-4">
        {/* Reply Banner */}
        {replyTo && (
          <div className="mb-3 flex items-center justify-between rounded-2xl border border-cyan-300/20 bg-cyan-400/10 px-4 py-3">
            <p className="text-xs text-cyan-200">
              Replying to{" "}
              <span className="font-semibold">@{replyTo.username}</span>
            </p>

            <button
              onClick={() => setReplyTo(null)}
              className="
                inline-flex items-center gap-1 rounded-xl
                px-2 py-1 text-xs text-slate-200
                transition hover:bg-white/10 active:scale-[0.98]
              "
            >
              <X className="h-3.5 w-3.5" />
              Cancel
            </button>
          </div>
        )}

        <div className={inputWrap}>
          <input
            className={inputField}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={replyTo ? "Write a reply…" : "Write a comment…"}
            maxLength={500}
          />

          <button
            onClick={handleSend}
            disabled={sending || !content.trim()}
            className="
              relative inline-flex items-center justify-center gap-2
              rounded-2xl bg-linear-to-r from-cyan-300 to-emerald-200
              px-4 py-2 text-sm font-semibold text-black
              transition hover:brightness-110 active:scale-[0.98]
              disabled:bg-white/10 disabled:text-slate-500 disabled:cursor-not-allowed
            "
          >
            {sending && (
              <span className="absolute inset-0 rounded-2xl bg-white/10 animate-pulse" />
            )}

            <span className="relative inline-flex items-center gap-2">
              <SendHorizonal className="h-4 w-4" />
              {sending ? "Posting…" : "Comment"}
            </span>
          </button>
        </div>

        <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
          <span>
            {content.trim().length === 0
              ? "Be respectful. Keep it clean."
              : "Looks good."}
          </span>
          <span className="tabular-nums">{content.length}/500</span>
        </div>
      </div>

      {/* LIST */}
      <div className="border-t border-white/10 px-5 py-5">
        {loading && <CommentsSkeleton />}

        {!loading && comments.length === 0 && (
          <div className="rounded-3xl border border-white/10 bg-white/5 p-8 text-center">
            <p className="text-sm text-slate-300">No comments yet</p>
            <p className="mt-1 text-xs text-slate-500">
              Start the conversation.
            </p>
          </div>
        )}

        {!loading && comments.length > 0 && (
          <div className="space-y-4">
            {comments.map((comment) => (
              <CommentCard
                key={comment._id}
                comment={comment}
                sessionUserId={sessionUserId}
                deleteLoadingId={deleteLoadingId}
                onReply={(id, username) => setReplyTo({ commentId: id, username })}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default Comments;

/* ================= COMMENT CARD ================= */

const CommentCard = ({
  comment,
  onReply,
  onDelete,
  depth = 0,
  sessionUserId,
  deleteLoadingId,
}: {
  comment: CommentItem;
  onReply: (commentId: string, username: string) => void;
  onDelete: (commentId: string) => void;
  depth?: number;
  sessionUserId: string | null;
  deleteLoadingId: string | null;
}) => {
  const formattedDate = useMemo(() => {
    try {
      return new Date(comment.createdAt).toLocaleString(undefined, {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    } catch {
      return "";
    }
  }, [comment.createdAt]);

  const isOwner = sessionUserId === comment.author._id;
  const deleting = deleteLoadingId === comment._id;

  return (
    <div className={["relative", depth > 0 ? "ml-6" : ""].join(" ")}>
      {/* Thread line for replies */}
      {depth > 0 && (
        <div className="pointer-events-none absolute -left-3 top-0 h-full w-px bg-white/10" />
      )}

      <div className="rounded-3xl border border-white/10 bg-white/5 p-4 transition hover:bg-white/[0.07]">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="relative h-10 w-10 overflow-hidden rounded-full ring-1 ring-white/10">
              <Image
                src={comment.author.avatar || "/avatar-placeholder.png"}
                alt={comment.author.username}
                fill
                className="object-cover"
              />
            </div>

            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-sm font-semibold text-white">
                  {comment.author.fullName}
                </p>
                <p className="text-xs text-slate-500">
                  @{comment.author.username}
                </p>
                <span className="text-white/20">•</span>
                <p className="text-xs text-slate-500">{formattedDate}</p>
              </div>

              <p className="mt-1 whitespace-pre-wrap text-sm text-slate-200">
                {comment.content}
              </p>

              <div className="mt-3 flex flex-wrap items-center gap-2">
                <button
                  onClick={() => onReply(comment._id, comment.author.username)}
                  className="
                    inline-flex items-center gap-2 rounded-2xl
                    bg-white/5 px-3 py-2 text-xs text-slate-300
                    transition hover:bg-white/10 hover:text-white
                    active:scale-[0.98]
                  "
                >
                  <CornerDownRight className="h-4 w-4" />
                  Reply
                </button>

                {isOwner && (
                  <button
                    onClick={() => onDelete(comment._id)}
                    disabled={deleting}
                    className="
                      relative inline-flex items-center gap-2 rounded-2xl
                      bg-red-500/10 px-3 py-2 text-xs text-red-300
                      transition hover:bg-red-500/15 hover:text-red-200
                      disabled:opacity-60 disabled:cursor-not-allowed
                      active:scale-[0.98]
                    "
                  >
                    {deleting && (
                      <span className="absolute inset-0 rounded-2xl bg-white/10 animate-pulse" />
                    )}
                    <span className="relative inline-flex items-center gap-2">
                      <Trash2 className="h-4 w-4" />
                      {deleting ? "Deleting…" : "Delete"}
                    </span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Replies */}
        {comment.replies && comment.replies.length > 0 && (
          <div className="mt-4 space-y-3">
            {comment.replies.map((reply) => (
              <CommentCard
                key={reply._id}
                comment={reply}
                sessionUserId={sessionUserId}
                deleteLoadingId={deleteLoadingId}
                onReply={onReply}
                onDelete={onDelete}
                depth={depth + 1}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

/* ================= SKELETON ================= */

const CommentsSkeleton = () => {
  return (
    <div className="space-y-4">
      {Array.from({ length: 3 }).map((_, idx) => (
        <div
          key={idx}
          className="animate-pulse rounded-3xl border border-white/10 bg-white/5 p-4"
        >
          <div className="flex items-start gap-3">
            <div className="h-10 w-10 rounded-full bg-white/10" />
            <div className="flex-1">
              <div className="h-4 w-40 rounded bg-white/10" />
              <div className="mt-2 h-3 w-64 rounded bg-white/10" />
              <div className="mt-2 h-3 w-52 rounded bg-white/10" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
