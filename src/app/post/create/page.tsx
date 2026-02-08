"use client";

import Navbar from "@/components/navbar";
import MediaCarousel from "@/components/MediaCarousel";
import PostHeader from "@/components/post/PostHeader";
import AutoResizeTextarea from "@/components/post/AutoResizeTextarea";
import VisibilitySelector from "@/components/post/VisibilitySelector";
import PostSettings from "@/components/post/PostSettings";
import MediaUploader from "@/components/post/MediaUploader";

import { useMemo, useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

const MAX_FILES = 4;

export default function CreatePost() {
  const router = useRouter();

  const [content, setContent] = useState("");
  const [media, setMedia] = useState<File[]>([]);
  const [visibility, setVisibility] = useState<
    "public" | "followers" | "private"
  >("public");

  const [hideLikes, setHideLikes] = useState(false);
  const [disableComments, setDisableComments] = useState(false);
  const [loading, setLoading] = useState(false);

  /* ===== Media Preview ===== */

const mediaPreview = useMemo<
  { url: string; type: "image" | "video" }[]
>(() => {
  return media.map((file) => ({
    url: URL.createObjectURL(file),
    type: file.type.startsWith("video/")
      ? "video"
      : "image",
  }));
}, [media]);

  useEffect(() => {
    return () => {
      mediaPreview.forEach((item) => URL.revokeObjectURL(item.url));
    };
  }, [mediaPreview]);

  /* ===== Submit ===== */

  const handleSubmit = async () => {
    if (!content.trim()) return;

    const formData = new FormData();
    formData.append("content", content);
    formData.append("visibility", visibility);
    formData.append("hideLikesCount", String(hideLikes));
    formData.append("disableComments", String(disableComments));

    media.forEach((file) => formData.append("media", file));

    try {
      setLoading(true);
      await axios.post("/api/posts/create", formData);
      router.replace("/");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-[#05080A] px-4 py-14 text-white">
        <div className="mx-auto w-full max-w-2xl rounded-4xl border border-white/10 bg-white/4 backdrop-blur-3xl p-8 sm:p-12">

          <PostHeader
            badge="Composer"
            title="Create a post"
            subtitle="Say something meaningful."
          />

          <AutoResizeTextarea
            value={content}
            onChange={setContent}
            placeholder="What’s on your mind?"
            showHint
          />

          {mediaPreview.length > 0 && (
            <div className="mt-8">
              <MediaCarousel
                items={mediaPreview}
                onRemove={(index) =>
                  setMedia((prev) => prev.filter((_, i) => i !== index))
                }
              />
            </div>
          )}

          <div className="mt-8 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <MediaUploader
              total={media.length}
              max={MAX_FILES}
              onAdd={(files) => {
                const remaining = MAX_FILES - media.length;
                setMedia((prev) => [
                  ...prev,
                  ...files.slice(0, remaining),
                ]);
              }}
            />

            <VisibilitySelector
              value={visibility}
              onChange={setVisibility}
            />
          </div>

          <PostSettings
            hideLikes={hideLikes}
            disableComments={disableComments}
            onToggleLikes={() => setHideLikes((p) => !p)}
            onToggleComments={() => setDisableComments((p) => !p)}
          />

          <button
            onClick={handleSubmit}
            disabled={loading || !content.trim()}
            className="mt-10 w-full rounded-3xl bg-linear-to-r from-cyan-300 via-teal-300 to-emerald-200 py-4 text-sm font-semibold text-black transition disabled:opacity-40"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Publishing...
              </span>
            ) : (
              "Publish Post"
            )}
          </button>
        </div>
      </main>
    </>
  );
}
