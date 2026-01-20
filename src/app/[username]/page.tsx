"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import { useSession } from "next-auth/react";
import Navbar from "@/components/navbar";

import {
  BadgeCheck,
  UserPlus,
  UserCheck,
  Pencil,
  ImageIcon,
  Play,
} from "lucide-react";

/* ================= TYPES ================= */

interface UserProfile {
  fullName: string;
  username: string;
  email: string;
  avatar: string;
  bio?: string;
  followersCount: number;
  followingCount: number;
  postsCount: number;
  isVerified: boolean;
}

interface Post {
  _id: string;
  content: string;
  createdAt: string;
  media?: {
    url: string;
    type: "image" | "video";
  };
}

/* ================= COMPONENT ================= */

const ProfilePage = () => {
  const params = useParams();
  const username = params?.username;

  const { data: session, status } = useSession();
  const router = useRouter();

  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const [posts, setPosts] = useState<Post[]>([]);
  const [postsLoading, setPostsLoading] = useState(true);

  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);

  /* ========== AUTH GUARD ========== */
  useEffect(() => {
    if (status === "unauthenticated") router.replace("/");
  }, [status, router]);

  /* ========== FETCH PROFILE ========== */
  useEffect(() => {
    if (status !== "authenticated") return;
    if (!username || Array.isArray(username)) return;

    const fetchProfile = async () => {
      try {
        const res = await axios.get("/api/profile", {
          params: { username },
        });
        setUser(res.data.user);
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [username, status]);

  const sessionUserName =
    session?.user && "username" in session.user
      ? (session.user as { username: string }).username
      : null;

  const isOwnProfile = sessionUserName === user?.username;

  /* ========== FOLLOW STATUS ========== */
  useEffect(() => {
    if (!user || isOwnProfile || status !== "authenticated") return;

    const fetchFollowStatus = async () => {
      try {
        const res = await axios.get("/api/follow/status", {
          params: { username: user.username },
        });
        setIsFollowing(res.data.following);
      } catch {
        setIsFollowing(false);
      }
    };

    fetchFollowStatus();
  }, [user, isOwnProfile, status]);

  /* ========== FETCH POSTS ========== */
  useEffect(() => {
    if (!user) return;

    const fetchPosts = async () => {
      try {
        const res = await axios.get("/api/posts/all-posts", {
          params: { username: user.username },
        });
        setPosts(res.data.posts);
      } catch {
        setPosts([]);
      } finally {
        setPostsLoading(false);
      }
    };

    fetchPosts();
  }, [user]);

  /* ========== FOLLOW TOGGLE ========== */
  const toggleFollow = async () => {
    if (!user || followLoading) return;

    setFollowLoading(true);
    try {
      const res = await axios.post("/api/follow", {
        followingUserName: user.username,
      });

      const followed = res.data.action === "followed";
      setIsFollowing(followed);

      setUser((prev) =>
        prev
          ? {
              ...prev,
              followersCount: followed
                ? prev.followersCount + 1
                : prev.followersCount - 1,
            }
          : prev,
      );
    } finally {
      setFollowLoading(false);
    }
  };

  /* ================= STATES ================= */

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex flex-col bg-[#0B1112]">
        <Navbar />

        <main className="flex-1 px-4 py-10">
          <div className="mx-auto max-w-3xl">
            <ProfileSkeleton />
          </div>
        </main>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col bg-[#0B1112]">
        <Navbar />

        <main className="flex-1 px-4 py-10">
          <div className="mx-auto max-w-3xl">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-8 text-center">
              <p className="text-sm text-slate-300">User not found</p>
              <p className="mt-1 text-xs text-slate-500">
                This profile doesn’t exist or was removed.
              </p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  /* ================= UI ================= */

  return (
    <div className="min-h-screen flex flex-col bg-[#0B1112]">
      <Navbar />

      <main className="flex-1">
        <div className="mx-auto max-w-3xl px-4 py-10">
          {/* ===== PROFILE HEADER CARD ===== */}
          <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#0F1718] shadow-[0_0_0_1px_rgba(255,255,255,0.04)]">
            {/* Soft glow */}
            <div className="pointer-events-none absolute inset-0">
              <div className="absolute -top-32 -right-32 h-72 w-72 rounded-full bg-cyan-400/10 blur-3xl" />
              <div className="absolute -bottom-32 -left-32 h-72 w-72 rounded-full bg-emerald-400/10 blur-3xl" />
            </div>

            <div className="relative p-6 sm:p-7">
              <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
                {/* Left */}
                <div className="flex items-start gap-4">
                  <div className="relative h-20 w-20 overflow-hidden rounded-full border border-white/10 ring-2 ring-cyan-300/20 shadow-lg sm:h-24 sm:w-24">
                    <Image
                      src={user.avatar || "/avatar-placeholder.png"}
                      alt={user.username}
                      fill
                      className="object-cover"
                    />
                  </div>

                  <div className="pt-1">
                    <div className="flex items-center gap-2">
                      <h1 className="text-xl font-semibold text-white">
                        {user.fullName}
                      </h1>

                      {user.isVerified && (
                        <span className="inline-flex items-center gap-1 rounded-full border border-cyan-300/20 bg-cyan-400/10 px-2 py-1 text-xs text-cyan-200">
                          <BadgeCheck className="h-4 w-4" />
                          Verified
                        </span>
                      )}
                    </div>

                    <p className="mt-1 text-sm text-slate-400">
                      @{user.username}
                    </p>

                    {user.bio && (
                      <p className="mt-3 max-w-lg text-sm leading-relaxed text-slate-300">
                        {user.bio}
                      </p>
                    )}
                  </div>
                </div>

                {/* Right */}
                <div className="flex items-center gap-2 sm:justify-end">
                  {isOwnProfile ? (
                    <button
                      onClick={() => alert("Edit profile coming soon")}
                      className="
                        inline-flex items-center gap-2 rounded-2xl
                        border border-white/10 bg-white/5 px-4 py-2
                        text-sm text-slate-200 transition
                        hover:bg-white/10 active:scale-[0.98]
                      "
                    >
                      <Pencil className="h-4 w-4" />
                      Edit profile
                    </button>
                  ) : (
                    <button
                      onClick={toggleFollow}
                      disabled={followLoading}
                      className={`
                        inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-semibold
                        transition active:scale-[0.98]
                        disabled:cursor-not-allowed disabled:opacity-60
                        ${
                          isFollowing
                            ? "border border-white/10 bg-white/5 text-slate-200 hover:bg-white/10"
                            : "bg-cyan-300 text-black hover:brightness-110"
                        }
                      `}
                    >
                      {followLoading ? (
                        "Please wait…"
                      ) : isFollowing ? (
                        <>
                          <UserCheck className="h-4 w-4" />
                          Following
                        </>
                      ) : (
                        <>
                          <UserPlus className="h-4 w-4" />
                          Follow
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>

              {/* Stats */}
              <div className="mt-6 grid grid-cols-3 gap-3">
                <Stat label="Posts" value={user.postsCount} />
                <Stat label="Followers" value={user.followersCount} />
                <Stat label="Following" value={user.followingCount} />
              </div>
            </div>
          </section>

          {/* ===== POSTS GRID ===== */}
          <section className="mt-8">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-white">Posts</h2>
              <p className="text-xs text-slate-500">
                {postsLoading ? "Loading…" : `${posts.length} total`}
              </p>
            </div>

            {postsLoading && <PostsSkeleton />}

            {!postsLoading && posts.length === 0 && (
              <div className="rounded-3xl border border-white/10 bg-white/5 p-10 text-center">
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/5">
                  <ImageIcon className="h-5 w-5 text-slate-400" />
                </div>
                <p className="text-sm text-slate-300">No posts yet</p>
                <p className="mt-1 text-xs text-slate-500">
                  When they post, it’ll show up here.
                </p>
              </div>
            )}

            {!postsLoading && posts.length > 0 && (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                {posts.map((post) => (
                  <button
                    key={post._id}
                    onClick={() => router.push(`/post/${post._id}`)}
                    className="
                      group relative aspect-square overflow-hidden rounded-2xl
                      border border-white/10 bg-white/3
                      text-left transition hover:border-white/20 active:scale-[0.99]
                    "
                  >
                    {/* MEDIA */}
                    {post.media ? (
                      post.media.type === "image" ? (
                        <Image
                          src={post.media.url}
                          alt="post media"
                          fill
                          className="object-contain transition duration-300 group-hover:scale-[1.03]"
                        />
                      ) : (
                        <div className="relative h-full w-full">
                          <video
                            src={post.media.url}
                            className="h-full w-full object-contain"
                            muted
                            loop
                            autoPlay
                            playsInline
                          />
                          <div className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-xl border border-white/10 bg-black/60 px-2 py-1 text-xs text-white backdrop-blur">
                            <Play className="h-3.5 w-3.5" />
                            Video
                          </div>
                        </div>
                      )
                    ) : (
                      <div className="flex h-full w-full items-center justify-center p-4 text-center">
                        <p className="line-clamp-5 text-sm text-slate-200">
                          {post.content}
                        </p>
                      </div>
                    )}

                    {/* OVERLAY */}
                    <div
                      className="
                        absolute inset-0 flex items-end p-3
                        bg-linear-to-t from-black/70 via-black/20 to-transparent
                        opacity-0 transition duration-200 group-hover:opacity-100
                      "
                    >
                      <p className="line-clamp-3 text-xs text-slate-200">
                        {post.content}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
};

/* ================= SMALL COMPONENTS ================= */

const Stat = ({ label, value }: { label: string; value: number }) => (
  <div className="rounded-2xl border border-white/10 bg-white/5 py-4 text-center">
    <p className="tabular-nums text-xl font-semibold text-white">{value}</p>
    <p className="mt-1 text-[11px] uppercase tracking-wide text-slate-500">
      {label}
    </p>
  </div>
);

/* ================= SKELETONS ================= */

const ProfileSkeleton = () => {
  return (
    <div className="animate-pulse overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="h-24 w-24 rounded-full bg-white/10" />

          <div className="pt-2">
            <div className="h-5 w-44 rounded bg-white/10" />
            <div className="mt-2 h-4 w-28 rounded bg-white/10" />
            <div className="mt-3 h-3 w-64 rounded bg-white/10" />
          </div>
        </div>

        <div className="h-10 w-28 rounded-2xl bg-white/10" />
      </div>

      <div className="mt-6 grid grid-cols-3 gap-3">
        <div className="h-20 rounded-2xl bg-white/10" />
        <div className="h-20 rounded-2xl bg-white/10" />
        <div className="h-20 rounded-2xl bg-white/10" />
      </div>
    </div>
  );
};

const PostsSkeleton = () => {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
      {Array.from({ length: 6 }).map((_, idx) => (
        <div
          key={idx}
          className="aspect-square animate-pulse rounded-2xl border border-white/10 bg-white/5"
        />
      ))}
    </div>
  );
};

export default ProfilePage;
