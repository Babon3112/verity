"use client";

import Navbar from "@/components/navbar";
import { useMemo, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import Image from "next/image";

import { Globe, Users, Lock, ImagePlus, X, Loader2 } from "lucide-react";

const CreatePost = () => {
  const [content, setContent] = useState("");
  const [media, setMedia] = useState<File | null>(null);
  const [visibility, setVisibility] = useState<
    "public" | "followers" | "private"
  >("public");
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

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-[#0B1112] px-4 py-10">
        <div className="mx-auto w-full max-w-2xl">
          {/* Card */}
          <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#0F1718] shadow-[0_0_0_1px_rgba(255,255,255,0.04)]">
            {/* Soft glow */}
            <div className="pointer-events-none absolute inset-0">
              <div className="absolute -top-32 -right-32 h-72 w-72 rounded-full bg-cyan-400/10 blur-3xl" />
              <div className="absolute -bottom-32 -left-32 h-72 w-72 rounded-full bg-emerald-400/10 blur-3xl" />
            </div>

            <div className="relative p-6 sm:p-8">
              {/* Header */}
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h1 className="text-xl font-semibold text-white">
                    Create a post
                  </h1>
                  <p className="mt-1 text-sm text-slate-400">
                    Share something cool. Keep it clean. Make it count.
                  </p>
                </div>

                <button
                  onClick={() => router.back()}
                  className="rounded-2xl bg-white/5 px-3 py-2 text-sm text-slate-300 transition hover:bg-white/10 hover:text-white active:scale-[0.98]"
                >
                  Cancel
                </button>
              </div>

              {/* Textarea */}
              <div className="mt-6">
                <div className="relative rounded-2xl border border-white/10 bg-black/30 p-4 transition focus-within:border-cyan-400/40">
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
                        ? "Tip: A short post with clear thought works best."
                        : "Looks good."}
                    </span>
                    <span className="tabular-nums">{content.length}/1000</span>
                  </div>
                </div>
              </div>

              {/* Media */}
              <div className="mt-5">
                <div className="flex items-center justify-between gap-4">
                  {/* Custom file button */}
                  <label className="inline-flex cursor-pointer items-center gap-2 rounded-2xl bg-white/5 px-4 py-2 text-sm text-slate-200 transition hover:bg-white/10 active:scale-[0.98]">
                    <ImagePlus className="h-4 w-4" />
                    Add media
                    <input
                      type="file"
                      accept="image/*,video/*"
                      onChange={(e) => setMedia(e.target.files?.[0] || null)}
                      className="hidden"
                    />
                  </label>

                  {/* Visibility pills */}
                  <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 p-1">
                    <button
                      onClick={() => setVisibility("public")}
                      className={`flex items-center gap-2 rounded-2xl px-3 py-2 text-xs transition active:scale-[0.98]
                        ${
                          visibility === "public"
                            ? "bg-cyan-400/15 text-cyan-200"
                            : "text-slate-300 hover:bg-white/5"
                        }
                      `}
                    >
                      <Globe className="h-4 w-4" />
                      Public
                    </button>

                    <button
                      onClick={() => setVisibility("followers")}
                      className={`flex items-center gap-2 rounded-2xl px-3 py-2 text-xs transition active:scale-[0.98]
                        ${
                          visibility === "followers"
                            ? "bg-cyan-400/15 text-cyan-200"
                            : "text-slate-300 hover:bg-white/5"
                        }
                      `}
                    >
                      <Users className="h-4 w-4" />
                      Followers
                    </button>

                    <button
                      onClick={() => setVisibility("private")}
                      className={`flex items-center gap-2 rounded-2xl px-3 py-2 text-xs transition active:scale-[0.98]
                        ${
                          visibility === "private"
                            ? "bg-cyan-400/15 text-cyan-200"
                            : "text-slate-300 hover:bg-white/5"
                        }
                      `}
                    >
                      <Lock className="h-4 w-4" />
                      Only me
                    </button>
                  </div>
                </div>

                {/* Preview */}
                {mediaPreviewUrl && (
                  <div className="mt-4 overflow-hidden rounded-2xl border border-white/10 bg-white/2">
                    <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
                      <p className="text-sm text-slate-200">
                        Selected:{" "}
                        <span className="text-slate-400">{media?.name}</span>
                      </p>

                      <button
                        onClick={() => setMedia(null)}
                        className="rounded-xl p-2 text-slate-400 transition hover:bg-white/5 hover:text-white"
                        aria-label="Remove media"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>

                    {/* ✅ 1:1 Preview */}
                    <div className="relative w-full aspect-square overflow-hidden bg-black/30">
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
              </div>

              {/* Submit */}
              <button
                onClick={handleSubmit}
                disabled={loading || !content.trim()}
                className="
                  mt-7 w-full rounded-2xl bg-cyan-300 py-3.5 text-sm font-semibold text-black
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
                Your post will be visible based on the selected privacy.
              </p>
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

export default CreatePost;
