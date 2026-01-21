"use client";

import { useEffect, useMemo, useState } from "react";
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
  Sparkles,
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
  const router = useRouter();
  const { data: session, status } = useSession();

  const username = useMemo(() => {
    const u = params?.username;
    if (!u || Array.isArray(u)) return null;
    return u;
  }, [params]);

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

  const sessionUserName =
    session?.user && "username" in session.user
      ? (session.user as { username: string }).username
      : null;

  const isOwnProfile = sessionUserName === user?.username;

  /* ========== FETCH PROFILE ========== */
  useEffect(() => {
    if (status !== "authenticated") return;
    if (!username) return;

    const fetchProfile = async () => {
      setLoading(true);
      try {
        const res = await axios.get("/api/profile", { params: { username } });
        setUser(res.data.user);
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [username, status]);

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
      setPostsLoading(true);
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
      <div className="min-h-screen bg-[#070B0C]">
        <Navbar />

        <main className="px-4 py-10">
          <div className="mx-auto max-w-3xl space-y-8">
            <ProfileSkeleton />
            <PostsSkeleton />
          </div>
        </main>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#070B0C]">
        <Navbar />

        <main className="px-4 py-10">
          <div className="mx-auto max-w-3xl">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-10 text-center">
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
    <div className="min-h-screen bg-[#070B0C]">
      <Navbar />

      <main className="px-4 py-10">
        <div className="mx-auto max-w-3xl space-y-8">
          {/* ===== PROFILE HEADER ===== */}
          <section className="relative overflow-hidden rounded-[28px] border border-white/10 bg-[#0B1213] shadow-[0_0_0_1px_rgba(255,255,255,0.03)]">
            {/* ===== AUTO GENERATED COVER (NO BANNER NEEDED) ===== */}
            <div className="relative h-28 w-full overflow-hidden">
              {/* Soft gradient base */}
              <div className="absolute inset-0 bg-linear-to-r from-cyan-400/20 via-slate-900/30 to-fuchsia-400/20" />

              {/* Glow blobs */}
              <div className="absolute -top-10 left-6 h-40 w-40 rounded-full bg-cyan-400/15 blur-3xl" />
              <div className="absolute -bottom-12 right-6 h-44 w-44 rounded-full bg-fuchsia-400/15 blur-3xl" />

              {/* Noise-style overlay */}
              <div className="absolute inset-0 opacity-[0.06] bg-[radial-gradient(circle_at_1px_1px,#fff_1px,transparent_0)] bg-size-[18px_18px]" />

              {/* Dark fade */}
              <div className="absolute inset-0 bg-black/40" />
            </div>

            <div className="relative px-6 pb-6 sm:px-7">
              {/* Avatar row */}
              <div className="-mt-12 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
                <div className="flex items-end gap-4">
                  <div className="relative h-24 w-24 overflow-hidden rounded-full border border-white/10 bg-white/5 ring-4 ring-black/60 shadow-xl sm:h-28 sm:w-28">
                    <Image
                      src={user.avatar || "/avatar-placeholder.png"}
                      alt={user.username}
                      fill
                      className="object-cover"
                    />
                  </div>

                  <div className="pb-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h1 className="text-xl font-semibold text-white sm:text-2xl">
                        {user.fullName}
                      </h1>

                      {user.isVerified && (
                        <span className="inline-flex items-center gap-1 rounded-full border border-cyan-300/25 bg-cyan-400/10 px-2.5 py-1 text-[11px] font-medium text-cyan-200">
                          <BadgeCheck className="h-4 w-4" />
                          Verified
                        </span>
                      )}
                    </div>

                    <p className="mt-1 text-sm text-slate-400">
                      @{user.username}
                    </p>

                    {user.bio ? (
                      <p className="mt-3 max-w-xl text-sm leading-relaxed text-slate-300">
                        {user.bio}
                      </p>
                    ) : (
                      <p className="mt-3 max-w-xl text-sm text-slate-500">
                        No bio yet.
                      </p>
                    )}
                  </div>
                </div>

                {/* Buttons */}
                <div className="flex items-center gap-2 sm:justify-end">
                  {isOwnProfile ? (
                    <button
                      onClick={() => alert("Edit profile coming soon")}
                      className="
                        inline-flex items-center gap-2 rounded-2xl
                        border border-white/10 bg-white/5 px-4 py-2
                        text-sm font-medium text-slate-200
                        transition hover:bg-white/10 active:scale-[0.98]
                      "
                    >
                      <Pencil className="h-4 w-4" />
                      Edit profile
                    </button>
                  ) : (
                    <button
                      onClick={toggleFollow}
                      disabled={followLoading}
                      aria-label={isFollowing ? "Unfollow user" : "Follow user"}
                      className={`
                        relative inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-semibold
                        transition active:scale-[0.98]
                        disabled:cursor-not-allowed disabled:opacity-70
                        ${
                          isFollowing
                            ? "border border-white/10 bg-white/5 text-slate-200 hover:bg-white/10"
                            : "bg-linear-to-r from-cyan-300 to-emerald-200 text-black hover:brightness-110"
                        }
                      `}
                    >
                      {followLoading && (
                        <span className="absolute inset-0 animate-pulse rounded-2xl bg-white/10" />
                      )}

                      <span className="relative inline-flex items-center gap-2">
                        {isFollowing ? (
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
                      </span>
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

          {/* ===== POSTS ===== */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-cyan-200" />
                <h2 className="text-sm font-semibold text-white">Posts</h2>
              </div>

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
                      border border-white/10 bg-white/5
                      text-left transition
                      hover:border-white/20 hover:bg-white/6
                      active:scale-[0.99]
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
                        bg-linear-to-t from-black/80 via-black/25 to-transparent
                        opacity-0 transition duration-200
                        group-hover:opacity-100
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
  <div className="rounded-2xl border border-white/10 bg-white/5 py-4 text-center transition hover:bg-white/[0.07]">
    <p className="tabular-nums text-xl font-semibold text-white">{value}</p>
    <p className="mt-1 text-[11px] uppercase tracking-wide text-slate-500">
      {label}
    </p>
  </div>
);

/* ================= SKELETONS ================= */

const ProfileSkeleton = () => {
  return (
    <div className="overflow-hidden rounded-[28px] border border-white/10 bg-white/5">
      <div className="relative h-28 w-full animate-pulse bg-white/5" />
      <div className="p-6 sm:p-7">
        <div className="-mt-12 flex items-end justify-between gap-4">
          <div className="flex items-end gap-4">
            <div className="h-24 w-24 rounded-full border border-white/10 bg-white/10 sm:h-28 sm:w-28" />

            <div className="pb-2">
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
