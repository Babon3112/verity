"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import axios from "axios";

export interface UserProfile {
  fullName: string;
  username: string;
  email: string;
  avatar: string;
  bio?: string;
  followersCount: number;
  followingCount: number;
  postsCount: number;
  isVerified: boolean;
  dateOfBirth: string;
  gender: "male" | "female" | "other";
}

interface EditProfileProps {
  user: UserProfile;
  onClose: () => void;
  onUpdated: (updatedUser: UserProfile) => void;
}

type UsernameStatus = "idle" | "checking" | "available" | "taken" | "invalid";

const EditProfileModal = ({
  user,
  onClose,
  onUpdated,
}: EditProfileProps) => {
  const [fullName, setFullName] = useState(user.fullName);
  const [username, setUsername] = useState(user.username);
  const [bio, setBio] = useState(user.bio || "");
  const [dateOfBirth, setDateOfBirth] = useState(
    user.dateOfBirth ? user.dateOfBirth.split("T")[0] : ""
  );
  const [gender, setGender] = useState<"male" | "female" | "other">(
    user.gender
  );

  const [avatarPreview, setAvatarPreview] = useState(user.avatar);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  const [usernameStatus, setUsernameStatus] =
    useState<UsernameStatus>("idle");

  const [usernameError, setUsernameError] = useState("");
  const [loading, setLoading] = useState(false);

  /* ================= USERNAME CHECK ================= */

  useEffect(() => {
    const cleaned = username.trim().toLowerCase();

    // If username unchanged → skip checking
    if (cleaned === user.username.toLowerCase()) {
      setUsernameStatus("idle");
      return;
    }

    if (!cleaned) {
      setUsernameStatus("idle");
      return;
    }

    if (cleaned.length < 3) {
      setUsernameStatus("invalid");
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setUsernameStatus("checking");

        const res = await axios.get("/api/check-username", {
          params: { username: cleaned },
        });

        setUsernameStatus(res.data.available ? "available" : "taken");
      } catch {
        setUsernameStatus("invalid");
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [username, user.username]);

  /* ================= AVATAR ================= */

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  /* ================= SUBMIT ================= */

  const handleSubmit = async () => {
    if (!fullName.trim() || !username.trim()) return;

    // If username changed → must be available
    if (
      username.toLowerCase() !== user.username.toLowerCase() &&
      usernameStatus !== "available"
    ) {
      setUsernameError("Please choose an available username.");
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("fullName", fullName.trim());
      formData.append("username", username.toLowerCase().trim());
      formData.append("bio", bio);
      formData.append("dateOfBirth", dateOfBirth);
      formData.append("gender", gender);

      if (avatarFile) {
        formData.append("avatar", avatarFile);
      }

      const res = await axios.put("/api/profile/update", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      onUpdated(res.data.user);
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const canSave =
    !loading &&
    fullName.trim() &&
    username.trim() &&
    (username.toLowerCase() === user.username.toLowerCase() ||
      usernameStatus === "available");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4">
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-[#0B1213] p-6 shadow-2xl overflow-y-auto max-h-[90vh]">
        <h2 className="mb-6 text-lg font-semibold text-white">
          Edit Profile
        </h2>

        {/* Avatar */}
        <div className="flex flex-col items-center gap-4">
          <div className="relative h-24 w-24 overflow-hidden rounded-full border border-white/10 bg-white/5">
            <Image
              src={
                avatarPreview ||
                "https://res.cloudinary.com/arnabcloudinary/image/upload/v1713075500/EazyBuy/Avatar/upload-avatar.png"
              }
              alt="avatar"
              fill
              className="object-cover"
            />
          </div>

          <label className="cursor-pointer text-sm text-cyan-300 hover:underline">
            Change avatar
            <input
              type="file"
              accept="image/*"
              hidden
              onChange={handleAvatarChange}
            />
          </label>
        </div>

        {/* Full Name */}
        <div className="mt-6">
          <label className="text-xs text-slate-400">Full Name</label>
          <input
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-400/50"
          />
        </div>

        {/* Username */}
        <div className="mt-4">
          <label className="text-xs text-slate-400">Username</label>
          <input
            value={username}
            onChange={(e) => {
              setUsername(e.target.value.toLowerCase());
              setUsernameError("");
            }}
            className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-400/50"
          />

          {username !== user.username && (
            <div className="mt-2 text-xs">
              {usernameStatus === "checking" && (
                <p className="text-slate-400">
                  Checking availability…
                </p>
              )}
              {usernameStatus === "available" && (
                <p className="text-emerald-300">
                  Username available
                </p>
              )}
              {usernameStatus === "taken" && (
                <p className="text-red-300">
                  Username already taken
                </p>
              )}
              {usernameStatus === "invalid" && (
                <p className="text-yellow-300">
                  Minimum 3 characters
                </p>
              )}
            </div>
          )}

          {usernameError && (
            <p className="mt-1 text-xs text-red-400">
              {usernameError}
            </p>
          )}
        </div>

        {/* Bio */}
        <div className="mt-4">
          <label className="text-xs text-slate-400">Bio</label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={3}
            maxLength={150}
            className="mt-1 w-full resize-none rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-400/50"
          />
          <p className="mt-1 text-xs text-slate-500">
            {bio.length}/150 characters
          </p>
        </div>

        {/* Date of Birth */}
        <div className="mt-4">
          <label className="text-xs text-slate-400">
            Date of Birth
          </label>
          <input
            type="date"
            value={dateOfBirth}
            onChange={(e) => setDateOfBirth(e.target.value)}
            className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-400/50"
          />
        </div>

        {/* Gender */}
        <div className="mt-4">
          <label className="text-xs text-slate-400">Gender</label>
          <select
            value={gender}
            onChange={(e) =>
              setGender(e.target.value as "male" | "female" | "other")
            }
            className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-400/50"
          >
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
        </div>

        {/* Buttons */}
        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300 hover:bg-white/10"
          >
            Cancel
          </button>

          <button
            onClick={handleSubmit}
            disabled={!canSave}
            className="rounded-xl bg-linear-to-r from-cyan-300 to-emerald-200 px-4 py-2 text-sm font-semibold text-black hover:brightness-110 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditProfileModal;
