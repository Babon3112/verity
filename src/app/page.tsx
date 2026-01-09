"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import axios from "axios";
import Image from "next/image";

import SignIn from "../components/signin";
import SignUp from "../components/signup";
import ForgotPassword from "../components/forgotPassword";
import Navbar from "@/components/navbar";
import { useRouter } from "next/navigation";

type AuthMode = "signin" | "signup" | "forgotPassword";

const AUTH_TABS: Extract<AuthMode, "signin" | "signup">[] = [
  "signin",
  "signup",
];

interface FeedPost {
  _id: string;
  content: string;
  createdAt: string;
  liked?: boolean;
  author: {
    username: string;
    fullName: string;
    avatar: string;
  };
  media?: {
    url: string;
    type: "image" | "video";
  };
}

const Home = () => {
  /* ================= HOOKS (ALWAYS FIRST) ================= */
  const { data: session, status } = useSession();
  const [mode, setMode] = useState<AuthMode>("signin");

  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [loadingFeed, setLoadingFeed] = useState(true);
  const router = useRouter();

  /* ================= FETCH FEED ================= */
  useEffect(() => {
    if (status !== "authenticated") return;

    const fetchFeed = async () => {
      try {
        const res = await axios.get("/api/feed");
        setPosts(
          res.data.posts.map((p: FeedPost) => ({
            ...p,
            liked: false,
          }))
        );
      } finally {
        setLoadingFeed(false);
      }
    };

    fetchFeed();
  }, [status]);

  /* ================= ACTION HANDLERS ================= */
  const handleLike = (postId: string) => {
    setPosts((prev) =>
      prev.map((post) =>
        post._id === postId
          ? { ...post, liked: !post.liked }
          : post
      )
    );
  };

  const handleShare = async (postId: string) => {
    const url = `${window.location.origin}/post/${postId}`;
    await navigator.clipboard.writeText(url);
    alert("Post link copied!");
  };

  /* ================= RENDER ================= */

  // Loading state (NO HOOKS BELOW THIS)
  if (status === "loading") {
    return (
      <main className="min-h-screen flex items-center justify-center bg-[#0f1115]">
        <p className="text-slate-400">Loading…</p>
      </main>
    );
  }

  // Authenticated → FEED
  if (status === "authenticated" && session) {
    return (
      <>
        <Navbar />

        <main className="min-h-screen bg-[#0f1115] py-8">
          <div className="mx-auto max-w-xl px-4 space-y-6">
            {loadingFeed && (
              <p className="text-center text-slate-400">
                Loading feed…
              </p>
            )}

            {!loadingFeed && posts.length === 0 && (
              <p className="text-center text-slate-500">
                No posts yet. Follow people or create your first post.
              </p>
            )}

            {posts.map((post) => (
              <article
                key={post._id}
                className="rounded-2xl bg-[#151821] border border-white/5 p-4"
              >
                {/* HEADER */}
                <div className="flex items-center gap-3">
                  <Image
                    src={post.author.avatar || "/avatar-placeholder.png"}
                    alt={post.author.username}
                    width={40}
                    height={40}
                    className="rounded-full cursor-pointer"
                    onClick={()=>{router.push(`${post.author.username}`)}}
                  />
                  <div>
                    <p className="text-sm font-semibold text-white">
                      {post.author.fullName}
                    </p>
                    <p className="text-xs text-slate-400">
                      @{post.author.username}
                    </p>
                  </div>
                </div>

                {/* CONTENT */}
                <p className="mt-3 text-sm text-slate-200 whitespace-pre-wrap">
                  {post.content}
                </p>

                {/* MEDIA */}
                {post.media && (
                  <div className="mt-3 overflow-hidden rounded-xl border border-white/5">
                    {post.media.type === "image" ? (
                      <Image
                        src={post.media.url}
                        alt="post media"
                        width={600}
                        height={400}
                        className="w-full object-cover"
                      />
                    ) : (
                      <video
                        src={post.media.url}
                        controls
                        className="w-full"
                      />
                    )}
                  </div>
                )}

                {/* ACTIONS */}
                <div className="mt-4 flex items-center justify-between text-sm text-slate-400">
                  <button
                    onClick={() => handleLike(post._id)}
                    className={`flex items-center gap-1 ${
                      post.liked
                        ? "text-red-500"
                        : "hover:text-red-400"
                    }`}
                  >
                    {post.liked ? "❤️" : "🤍"} Like
                  </button>

                  <button
                    onClick={() => alert("Comments coming soon")}
                    className="hover:text-[#00F7FF]"
                  >
                    💬 Comment
                  </button>

                  <button
                    onClick={() => handleShare(post._id)}
                    className="hover:text-[#B0FFFA]"
                  >
                    🔗 Share
                  </button>
                </div>

                <p className="mt-2 text-xs text-slate-500">
                  {new Date(post.createdAt).toLocaleString()}
                </p>
              </article>
            ))}
          </div>
        </main>
      </>
    );
  }

  // Unauthenticated → AUTH UI
  return (
    <main className="min-h-screen flex items-center justify-center bg-[#0f1115] px-4">
      <div className="w-full max-w-md rounded-2xl bg-[#151821] border border-white/5 p-8 shadow-xl">
        <div className="text-center space-y-1">
          <h1 className="text-3xl font-bold text-white">
            Verity
          </h1>
          <p className="text-sm text-slate-400">
            Truth, clarity, control
          </p>
        </div>

        {mode !== "forgotPassword" && (
          <div className="mt-6 flex rounded-full bg-[#0f1115] p-1">
          {AUTH_TABS.map((item) => {
            const isActive = mode === item;

            return (
              <button
                key={item}
                onClick={() => setMode(item)}
                className={[
                  "flex-1 py-2 text-sm font-medium transition",
                  isActive
                    ? "text-white"
                    : "text-slate-400 hover:text-[#B0FFFA]",
                  isActive && item === "signin"
                    ? "bg-gradient-to-r from-[#00F7FF] to-[] rounded-l-full"
                    : "",
                  isActive && item === "signup"
                    ? "bg-gradient-to-r from-[] to-[#00F7FF] rounded-r-full"
                    : "",
                ].join(" ")}
              >
                {item === "signin" ? "Sign In" : "Sign Up"}
              </button>
            );
          })}
        </div>
        )}

        <div className="mt-6">
          {mode === "signin" && (
            <>
              <SignIn />
              <button
                onClick={() => setMode("forgotPassword")}
                className="mt-4 block w-full text-sm text-slate-400 hover:text-[#B0FFFA]"
              >
                Forgot password?
              </button>
            </>
          )}

          {mode === "signup" && <SignUp />}

          {mode === "forgotPassword" && (
            <>
              <ForgotPassword />
              <button
                onClick={() => setMode("signin")}
                className="mt-4 block w-full text-sm text-slate-400 hover:text-[#B0FFFA]"
              >
                Back to sign in
              </button>
            </>
          )}
        </div>

        <p className="mt-8 text-center text-xs text-slate-500">
          © 2026 Verity
        </p>
      </div>
    </main>
  );
};

export default Home;
