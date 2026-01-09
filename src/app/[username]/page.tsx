"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import { useSession } from "next-auth/react";
import Navbar from "@/components/navbar";

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
    if (status === "unauthenticated") {
      router.replace("/");
    }
  }, [status, router]);

  /* ========== FETCH PROFILE ========== */
  useEffect(() => {
    if (status !== "authenticated") return;
    if (!username || Array.isArray(username)) return;

    const fetchProfile = async () => {
      try {
        const res = await axios.get("/api/profile", {
          params: { username: username },
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
          : prev
      );
    } finally {
      setFollowLoading(false);
    }
  };

  /* ========== STATES ========== */

  if (status === "loading" || loading) {
    return (
      <div className="flex justify-center mt-24 text-neutral-400">
        Loading profile…
      </div>
    );
  }

  if (!user) {
    return (
      <>
        <Navbar />
        <div className="flex justify-center mt-24 text-neutral-400">
          User not found
        </div>
      </>
    );
  }

  /* ========== UI ========== */

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-[#0f1115]">
        <div className="max-w-3xl mx-auto px-4 py-12">
          {/* ===== PROFILE CARD ===== */}
          <div className="rounded-2xl border border-white/5 bg-[#151821] p-8">
            <div className="flex items-center gap-6">
              <Image
                src={user.avatar || "/avatar-placeholder.png"}
                alt={user.username}
                width={120}
                height={120}
                className="rounded-full border-2 border-[#B0FFFA]"
              />

              <div className="flex-1">
                <h1 className="text-2xl font-semibold text-neutral-100">
                  {user.fullName}
                </h1>
                <p className="text-sm text-neutral-400">@{user.username}</p>
              </div>

              {isOwnProfile ? (
                <button className="rounded-lg px-4 py-2 text-sm bg-neutral-800 text-neutral-100 hover:bg-neutral-700">
                  Edit profile
                </button>
              ) : (
                <button
                  onClick={toggleFollow}
                  disabled={followLoading}
                  className={
                    isFollowing
                      ? "rounded-lg px-4 py-2 text-sm bg-neutral-800 text-white"
                      : "rounded-lg px-4 py-2 text-sm bg-[#00F7FF] text-black"
                  }
                >
                  {followLoading
                    ? "Please wait…"
                    : isFollowing
                    ? "Following"
                    : "Follow"}
                </button>
              )}
            </div>

            {user.bio && <p className="mt-6 text-neutral-300">{user.bio}</p>}

            <div className="mt-8 grid grid-cols-3 gap-6 text-center">
              <Stat label="Posts" value={user.postsCount} />
              <Stat label="Followers" value={user.followersCount} />
              <Stat label="Following" value={user.followingCount} />
            </div>
          </div>

          {/* ===== POSTS GRID ===== */}
          <div className="mt-10">
            {postsLoading && (
              <p className="text-center text-neutral-400">Loading posts…</p>
            )}

            {!postsLoading && posts.length === 0 && (
              <p className="text-center text-neutral-500">No posts yet</p>
            )}

            {!postsLoading && posts.length > 0 && (
              <div className="grid grid-cols-3 gap-4">
                {posts.map((post) => (
                  <div
                    key={post._id}
                    className="
            group relative
            aspect-square
            rounded-xl
            overflow-hidden
            border border-white/5
            bg-[#151821]
          "
                  >
                    {/* MEDIA */}
                    {post.media ? (
                      post.media.type === "image" ? (
                        <Image
                          src={post.media.url}
                          alt="post media"
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <video
                          src={post.media.url}
                          className="h-full w-full object-cover"
                          muted
                          loop
                        />
                      )
                    ) : (
                      <div
                        className="
              h-full w-full
              flex items-center justify-center
              p-4 text-sm text-neutral-300
              text-center
            "
                      >
                        {post.content}
                      </div>
                    )}

                    {/* OVERLAY */}
                    <div
                      className="
            absolute inset-0
            bg-black/60 opacity-0
            group-hover:opacity-100
            transition
            flex items-end
            p-3
          "
                    >
                      <p className="text-xs text-neutral-200 line-clamp-3">
                        {post.content}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  );
};

/* ================= STAT COMPONENT ================= */

const Stat = ({ label, value }: { label: string; value: number }) => (
  <div className="rounded-xl bg-neutral-800/60 py-4">
    <p className="text-xl font-semibold text-neutral-100">{value}</p>
    <p className="mt-1 text-xs uppercase tracking-wide text-neutral-400">
      {label}
    </p>
  </div>
);

export default ProfilePage;
