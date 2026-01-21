"use client";

import Navbar from "@/components/navbar";
import { useMemo, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import Image from "next/image";

import { Globe, Users, Lock, ImagePlus, X, Loader2, Sparkles } from "lucide-react";

const CreatePost = () => {
  const [content, setContent] = useState("");
  const [media, setMedia] = useState<File | null>(null);
  const [visibility, setVisibility] = useState<"public" | "followers" | "private">(
    "public",
  );
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  const mediaPreviewUrl = useMemo(() => {
    if (!media) return null;
    return URL.createObjectURL(media);
  }, [media]);

  const isVideo = useMemo(() => {
    if (!media) return false;
    return media.type.startsWith("video/");
  }, [media]);

  const handleSubmit = async () => {
    if (!content.trim()) return;

    const formData = new FormData();
    formData.append("content", content);
    formData.append("visibility", visibility);

    if (media) formData.append("media", media);

    try {
      setLoading(true);
      await axios.post("/api/posts/create", formData);
      router.replace("/");
    } catch (err) {
      console.log(err);
      alert("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const visibilityLabel =
    visibility === "public"
      ? "Public"
      : visibility === "followers"
        ? "Followers"
        : "Only me";

  return (
    <>
      <Navbar />

      <main className="relative min-h-screen bg-[#070B0C] px-4 py-10 text-white">
        {/* Background glow */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-36 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-cyan-400/10 blur-3xl" />
          <div className="absolute top-44 -right-27.5 h-80 w-80 rounded-full bg-fuchsia-400/10 blur-3xl" />
        </div>

        <div className="relative mx-auto w-full max-w-2xl">
          {/* Card */}
          <div
            className="
              relative overflow-hidden rounded-[28px]
              border border-white/10 bg-black/30 backdrop-blur-xl
              shadow-[0_0_0_1px_rgba(255,255,255,0.03)]
            "
          >
            {/* subtle glow blobs */}
            <div className="pointer-events-none absolute -top-24 left-10 h-40 w-40 rounded-full bg-cyan-400/10 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-28 right-0 h-52 w-52 rounded-full bg-fuchsia-400/10 blur-3xl" />

            <div className="relative p-6 sm:p-8">
              {/* Header */}
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-slate-200">
                    <Sparkles className="h-4 w-4 text-cyan-300" />
                    Composer
                  </div>

                  <h1 className="mt-4 text-xl font-semibold tracking-tight text-white">
                    Create a post
                  </h1>
                  <p className="mt-1 text-sm text-slate-400">
                    Share something cool. Keep it clean. Make it count.
                  </p>
                </div>

                <button
                  onClick={() => router.back()}
                  className="
                    inline-flex items-center justify-center
                    rounded-2xl border border-white/10 bg-white/5 px-3 py-2
                    text-sm text-slate-200 transition
                    hover:bg-white/10 active:scale-[0.98]
                  "
                >
                  Cancel
                </button>
              </div>

              {/* Textarea */}
              <div className="mt-6">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4 transition focus-within:border-cyan-400/40 focus-within:bg-white/[0.07]">
                  <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="What’s on your mind?"
                    maxLength={1000}
                    rows={6}
                    className="
                      w-full resize-none bg-transparent text-sm text-white
                      placeholder:text-slate-500 outline-none leading-relaxed
                    "
                  />

                  {/* Counter */}
                  <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
                    <span>
                      {content.trim().length === 0
                        ? "Tip: Short + clear posts work best."
                        : "Looks good."}
                    </span>
                    <span className="tabular-nums">{content.length}/1000</span>
                  </div>
                </div>
              </div>

              {/* Toolbar */}
              <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                {/* File picker */}
                <label
                  className="
                    inline-flex cursor-pointer items-center justify-center gap-2 rounded-2xl
                    border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200
                    transition hover:bg-white/10 active:scale-[0.98]
                  "
                >
                  <ImagePlus className="h-4 w-4" />
                  {media ? "Change media" : "Add media"}
                  <input
                    type="file"
                    accept="image/*,video/*"
                    onChange={(e) => setMedia(e.target.files?.[0] || null)}
                    className="hidden"
                  />
                </label>

                {/* Visibility selector */}
                <div className="flex items-center justify-between gap-2 rounded-2xl border border-white/10 bg-white/5 p-1">
                  <VisibilityButton
                    active={visibility === "public"}
                    onClick={() => setVisibility("public")}
                    icon={<Globe className="h-4 w-4" />}
                    label="Public"
                  />
                  <VisibilityButton
                    active={visibility === "followers"}
                    onClick={() => setVisibility("followers")}
                    icon={<Users className="h-4 w-4" />}
                    label="Followers"
                  />
                  <VisibilityButton
                    active={visibility === "private"}
                    onClick={() => setVisibility("private")}
                    icon={<Lock className="h-4 w-4" />}
                    label="Only me"
                  />
                </div>
              </div>

              {/* Preview */}
              {mediaPreviewUrl && (
                <div className="mt-4 overflow-hidden rounded-[22px] border border-white/10 bg-white/5">
                  <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-slate-200">
                        Selected media
                      </p>
                      <p className="truncate text-xs text-slate-500">
                        {media?.name}
                      </p>
                    </div>

                    <button
                      onClick={() => setMedia(null)}
                      className="
                        rounded-2xl border border-white/10 bg-white/5 p-2
                        text-slate-300 transition hover:bg-white/10 hover:text-white
                      "
                      aria-label="Remove media"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>

                  {/* 1:1 Preview */}
                  <div className="relative aspect-square w-full overflow-hidden bg-black/20">
                    {isVideo ? (
                      <video
                        src={mediaPreviewUrl}
                        controls
                        className="absolute inset-0 h-full w-full object-contain"
                      />
                    ) : (
                      <Image
                        src={mediaPreviewUrl}
                        alt="Media preview"
                        fill
                        className="object-contain"
                      />
                    )}
                  </div>
                </div>
              )}

              {/* Submit */}
              <button
                onClick={handleSubmit}
                disabled={loading || !content.trim()}
                className="
                  mt-7 w-full rounded-2xl
                  bg-linear-to-r from-cyan-300 to-emerald-200
                  py-3.5 text-sm font-semibold text-black
                  shadow-[0_10px_30px_-18px_rgba(34,211,238,0.65)]
                  transition hover:brightness-110 active:scale-[0.99]
                  disabled:bg-white/10 disabled:text-slate-500 disabled:cursor-not-allowed
                "
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Posting...
                  </span>
                ) : (
                  "Post"
                )}
              </button>

              <p className="mt-3 text-center text-xs text-slate-500">
                Visibility: <span className="text-slate-300">{visibilityLabel}</span>
              </p>
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

export default CreatePost;

/* ================= SMALL UI ================= */

const VisibilityButton = ({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) => {
  return (
    <button
      onClick={onClick}
      className={`
        flex items-center gap-2 rounded-2xl px-3 py-2 text-xs
        transition active:scale-[0.98]
        ${
          active
            ? "bg-white/10 text-cyan-200 border border-cyan-300/20"
            : "text-slate-300 hover:bg-white/5"
        }
      `}
    >
      {icon}
      {label}
    </button>
  );
};
