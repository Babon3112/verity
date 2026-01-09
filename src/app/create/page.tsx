"use client";

import Navbar from "@/components/navbar";
import { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

const CreatePost = () => {
  const [content, setContent] = useState("");
  const [media, setMedia] = useState<File | null>(null);
  const [visibility, setVisibility] =
    useState<"public" | "followers" | "private">("public");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async () => {
    if (!content.trim()) return;

    const formData = new FormData();
    formData.append("content", content);
    formData.append("visibility", visibility);

    if (media) {
      formData.append("media", media);
    }

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

      <main className="min-h-screen bg-[#0f1115] px-4 py-10">
        <div className="mx-auto max-w-xl rounded-2xl bg-[#151821] p-6 border border-white/5">
          <h1 className="text-lg font-semibold text-white mb-4">
            Create post
          </h1>

          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="What’s on your mind?"
            maxLength={1000}
            className="
              w-full resize-none rounded-lg bg-neutral-900 p-4 text-sm text-white
              outline-none border border-neutral-700
              focus:border-[#00F7FF]
            "
            rows={5}
          />

          <div className="mt-4 flex items-center justify-between">
            <input
              type="file"
              accept="image/*,video/*"
              onChange={(e) => setMedia(e.target.files?.[0] || null)}
              className="text-sm text-neutral-400"
            />

            <select
              value={visibility}
              onChange={(e) =>
                setVisibility(e.target.value as typeof visibility)
              }
              className="
                rounded-lg bg-neutral-900 border border-neutral-700
                text-sm text-white px-3 py-2
              "
            >
              <option value="public">Public</option>
              <option value="followers">Followers</option>
              <option value="private">Only me</option>
            </select>
          </div>

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="
              mt-6 w-full rounded-lg bg-[#00F7FF] py-3 text-sm font-medium text-black
              hover:brightness-110 transition
              disabled:bg-neutral-700 disabled:text-neutral-400
            "
          >
            {loading ? "Posting…" : "Post"}
          </button>
        </div>
      </main>
    </>
  );
};

export default CreatePost;
