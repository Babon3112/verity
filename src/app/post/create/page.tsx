"use client";

import Navbar from "@/components/navbar";
import { useMemo, useState, useEffect, useRef } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

import {
  Globe,
  Users,
  Lock,
  ImagePlus,
  Loader2,
  Sparkles,
} from "lucide-react";

import MediaCarousel from "@/components/MediaCarousel";

const MAX_FILES = 4;

const CreatePost = () => {
  const [content, setContent] = useState("");
  const [media, setMedia] = useState<File[]>([]);
  const [visibility, setVisibility] = useState<
    "public" | "followers" | "private"
  >("public");
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  /* ================= AUTO RESIZE ================= */

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setContent(value);

    const el = textareaRef.current;
    if (!el) return;

    el.style.height = "auto";
    el.style.height = el.scrollHeight + "px";
  };

  // Resize properly if content is pre-filled
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;

    el.style.height = "auto";
    el.style.height = el.scrollHeight + "px";
  }, []);

  /* ================= MEDIA PREVIEW ================= */

  const mediaPreviewUrls = useMemo(() => {
    return media.map((file) => ({
      url: URL.createObjectURL(file),
      isVideo: file.type.startsWith("video/"),
      name: file.name,
    }));
  }, [media]);

  useEffect(() => {
    return () => {
      mediaPreviewUrls.forEach((item) => {
        URL.revokeObjectURL(item.url);
      });
    };
  }, [mediaPreviewUrls]);

  /* ================= SUBMIT ================= */

  const handleSubmit = async () => {
    if (!content.trim()) return;

    const formData = new FormData();
    formData.append("content", content);
    formData.append("visibility", visibility);

    media.forEach((file) => {
      formData.append("media", file);
    });

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
        <div className="relative mx-auto w-full max-w-2xl">
          <div className="relative overflow-hidden rounded-[28px] border border-white/10 bg-black/30 backdrop-blur-xl">
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
                  className="inline-flex items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-200 transition hover:bg-white/10 active:scale-[0.98]"
                >
                  Cancel
                </button>
              </div>

              {/* Textarea */}
              <div className="mt-6">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4 transition focus-within:border-cyan-400/40 focus-within:bg-white/[0.07]">
                  <textarea
                    ref={textareaRef}
                    value={content}
                    onChange={handleInput}
                    placeholder="What’s on your mind?"
                    maxLength={1000}
                    rows={1}
                    className="w-full resize-none overflow-hidden bg-transparent text-sm text-white placeholder:text-slate-500 outline-none leading-relaxed min-h-12"
                  />

                  <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
                    <span>
                      {content.trim().length === 0
                        ? "Tip: Short + clear posts work best."
                        : "Looks good."}
                    </span>
                    <span className="tabular-nums">
                      {content.length}/1000
                    </span>
                  </div>
                </div>
              </div>

              {/* Toolbar */}
              <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <label
                  className={`inline-flex flex-col items-start justify-center gap-1 rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200 transition active:scale-[0.98]
                  ${
                    media.length >= MAX_FILES
                      ? "opacity-60 cursor-not-allowed"
                      : "cursor-pointer hover:bg-white/10"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <ImagePlus className="h-4 w-4" />
                    {media.length >= MAX_FILES
                      ? "Maximum 4 files reached"
                      : "Add media"}
                  </div>

                  <span className="text-xs text-slate-400">
                    {media.length}/{MAX_FILES} files
                  </span>

                  <input
                    type="file"
                    accept="image/*,video/*"
                    multiple
                    disabled={media.length >= MAX_FILES}
                    onChange={(e) => {
                      const files = Array.from(e.target.files || []);
                      const remaining = MAX_FILES - media.length;
                      const limited = files.slice(0, remaining);
                      setMedia((prev) => [...prev, ...limited]);
                    }}
                    className="hidden"
                  />
                </label>

                <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 p-1">
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

              {/* Media Preview */}
              {mediaPreviewUrls.length > 0 && (
                <div className="mt-5">
                  <MediaCarousel
                    items={mediaPreviewUrls.map((item) => ({
                      url: item.url,
                      type: item.isVideo ? "video" : "image",
                    }))}
                    onRemove={(index) => {
                      setMedia((prev) =>
                        prev.filter((_, i) => i !== index)
                      );
                    }}
                  />
                </div>
              )}

              {/* Submit */}
              <button
                onClick={handleSubmit}
                disabled={loading || !content.trim()}
                className="mt-7 w-full rounded-2xl bg-linear-to-r from-cyan-300 to-emerald-200 py-3.5 text-sm font-semibold text-black transition hover:brightness-110 active:scale-[0.99] disabled:bg-white/10 disabled:text-slate-500 disabled:cursor-not-allowed"
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
                Visibility:{" "}
                <span className="text-slate-300">{visibilityLabel}</span>
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
      className={`flex items-center gap-2 rounded-2xl px-3 py-2 text-xs transition active:scale-[0.98]
        ${
          active
            ? "bg-white/10 text-cyan-200 border border-cyan-300/20"
            : "text-slate-300 hover:bg-white/5"
        }`}
    >
      {icon}
      {label}
    </button>
  );
};
