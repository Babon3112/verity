"use client";

import Navbar from "@/components/navbar";
import MediaCarousel from "@/components/MediaCarousel";
import PostHeader from "@/components/post/PostHeader";
import AutoResizeTextarea from "@/components/post/AutoResizeTextarea";
import VisibilitySelector from "@/components/post/VisibilitySelector";
import PostSettings from "@/components/post/PostSettings";
import MediaUploader from "@/components/post/MediaUploader";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Loader2 } from "lucide-react";

const MAX_FILES = 4;

export default function EditPost() {
  const router = useRouter();
  const params = useParams();

  const postId = useMemo(() => {
    const id = params?.postId;
    if (!id || Array.isArray(id)) return null;
    return id;
  }, [params]);

  const [content, setContent] = useState("");
  const [visibility, setVisibility] = useState<
    "public" | "followers" | "private"
  >("public");

  const [hideLikes, setHideLikes] = useState(false);
  const [disableComments, setDisableComments] = useState(false);

  const [existingMedia, setExistingMedia] = useState<any[]>([]);
  const [newMedia, setNewMedia] = useState<File[]>([]);

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [originalData, setOriginalData] = useState<any>(null);

  /* ===== Fetch ===== */

  useEffect(() => {
    if (!postId) return;

    const fetchPost = async () => {
      try {
        const res = await axios.get("/api/posts/get-single", {
          params: { postId },
        });

        const post = res.data.post;

        setContent(post.content);
        setVisibility(post.visibility);
        setExistingMedia(post.media || []);
        setHideLikes(post.hideLikesCount || false);
        setDisableComments(post.disableComments || false);

        setOriginalData({
          content: post.content,
          visibility: post.visibility,
          hideLikes: post.hideLikesCount || false,
          disableComments: post.disableComments || false,
          media: post.media || [],
        });
      } catch {
        router.push("/");
      } finally {
        setFetching(false);
      }
    };

    fetchPost();
  }, [postId, router]);

  /* ===== Preview ===== */

  const newMediaPreview = useMemo(() => {
    return newMedia.map((file) => ({
      url: URL.createObjectURL(file),
      type: file.type.startsWith("video/") ? "video" : "image",
    }));
  }, [newMedia]);

  useEffect(() => {
    return () => {
      newMediaPreview.forEach((item) => URL.revokeObjectURL(item.url));
    };
  }, [newMediaPreview]);

  const totalMedia = existingMedia.length + newMedia.length;

  const hasChanges = useMemo(() => {
    if (!originalData) return false;

    return (
      content !== originalData.content ||
      visibility !== originalData.visibility ||
      hideLikes !== originalData.hideLikes ||
      disableComments !== originalData.disableComments ||
      existingMedia.length !== originalData.media.length ||
      newMedia.length > 0
    );
  }, [
    content,
    visibility,
    hideLikes,
    disableComments,
    existingMedia,
    newMedia,
    originalData,
  ]);

  /* ===== Submit ===== */

  const handleSubmit = async () => {
    if (!postId || !hasChanges) return;

    const formData = new FormData();
    formData.append("postId", postId);
    formData.append("content", content);
    formData.append("visibility", visibility);
    formData.append("existingMedia", JSON.stringify(existingMedia));
    formData.append("hideLikesCount", hideLikes.toString());
    formData.append("disableComments", disableComments.toString());

    newMedia.forEach((file) =>
      formData.append("media", file)
    );

    try {
      setLoading(true);
      await axios.put("/api/posts/edit", formData);
      router.push(`/post/${postId}`);
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <>
        <Navbar />
        <div className="flex min-h-screen items-center justify-center bg-[#05080A] text-white">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-[#05080A] px-4 py-14 text-white">
        <div className="mx-auto w-full max-w-2xl rounded-4xl border border-white/10 bg-white/4 backdrop-blur-3xl p-8 sm:p-12">

          <PostHeader
            badge="Editor"
            title="Edit your post"
            subtitle="Update caption, media or settings."
          />

          <AutoResizeTextarea
            value={content}
            onChange={setContent}
          />

          {(existingMedia.length > 0 || newMedia.length > 0) && (
            <div className="mt-8">
              <MediaCarousel
                items={[
                  ...existingMedia.map((m) => ({
                    url: m.url,
                    type: m.type,
                  })),
                  ...newMediaPreview,
                ]}
                onRemove={(index) => {
                  if (index < existingMedia.length) {
                    setExistingMedia((prev) =>
                      prev.filter((_, i) => i !== index)
                    );
                  } else {
                    const newIndex = index - existingMedia.length;
                    setNewMedia((prev) =>
                      prev.filter((_, i) => i !== newIndex)
                    );
                  }
                }}
              />
            </div>
          )}

          <div className="mt-8 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <MediaUploader
              total={totalMedia}
              max={MAX_FILES}
              onAdd={(files) => {
                const remaining = MAX_FILES - totalMedia;
                setNewMedia((prev) => [
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
            disabled={loading || !hasChanges}
            className="mt-10 w-full rounded-3xl bg-linear-to-r from-cyan-300 via-teal-300 to-emerald-200 py-4 text-sm font-semibold text-black transition disabled:opacity-40"
          >
            {loading ? "Updating..." : "Save Changes"}
          </button>
        </div>
      </main>
    </>
  );
}
