"use client";

import { signOut, useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { Search, LogOut, Plus, User2, ChevronDown } from "lucide-react";

const Navbar = () => {
  const { data: session } = useSession();
  const router = useRouter();

  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);

  const dropdownRef = useRef<HTMLDivElement | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    router.push(`/${query.toLowerCase().trim()}`);
    setQuery("");
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!dropdownRef.current) return;
      if (!dropdownRef.current.contains(event.target as Node)) setOpen(false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!session) return null;

  return (
    <nav className="sticky top-0 z-50">
      {/* Glass background */}
      <div className="border-b border-white/10 bg-black/50 backdrop-blur-xl">
        {/* Glow line */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-cyan-300/30 to-transparent" />

        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4">
          {/* LEFT */}
          <div className="flex items-center gap-4">
            {/* Logo */}
            <Link
              href="/"
              className="flex items-center gap-2 select-none"
            >
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-2xl border border-white/10 bg-white/5">
                <span className="text-sm font-bold text-cyan-200">V</span>
              </span>
              <span className="text-lg font-semibold text-white tracking-wide">
                Verity
              </span>
            </Link>

            {/* Search (desktop) */}
            <form
              onSubmit={handleSubmit}
              className="
                hidden sm:flex items-center gap-2
                w-85 rounded-2xl
                bg-white/5 px-4 py-2.5
                border border-white/10
                focus-within:border-cyan-300/40
                focus-within:bg-white/[0.07]
                transition
              "
            >
              <Search className="h-4 w-4 text-slate-400" />
              <input
                className="
                  w-full bg-transparent text-sm text-white
                  placeholder:text-slate-500 outline-none
                "
                placeholder="Search username..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </form>
          </div>

          {/* RIGHT */}
          <div className="flex items-center gap-3">
            {/* Post button */}
            <Link
              href="/post/create"
              className="
                inline-flex items-center gap-2 rounded-2xl
                bg-linear-to-r from-cyan-300 to-emerald-200
                px-4 py-2 text-sm font-semibold text-black
                shadow-[0_10px_25px_-15px_rgba(34,211,238,0.65)]
                transition hover:brightness-110 active:scale-[0.98]
              "
            >
              <Plus className="h-4 w-4" />
              Post
            </Link>

            {/* Profile Dropdown */}
            <div ref={dropdownRef} className="relative">
              <button
                onClick={() => setOpen((p) => !p)}
                className="
                  flex items-center gap-2 rounded-2xl
                  bg-white/5 px-2 py-1.5
                  border border-white/10
                  hover:bg-white/10 transition
                "
              >
                <div className="relative h-9 w-9 overflow-hidden rounded-full ring-1 ring-white/10">
                  <Image
                    src={session.user?.avatar || "/avatar-placeholder.png"}
                    alt="profile"
                    fill
                    className="object-cover"
                  />
                </div>

                <div className="hidden md:block text-left leading-tight">
                  <p className="text-sm font-semibold text-white">
                    {session.user?.fullName || "User"}
                  </p>
                  <p className="text-xs text-slate-400">
                    @{session.user?.username}
                  </p>
                </div>

                <ChevronDown
                  className={`h-4 w-4 text-slate-400 transition ${
                    open ? "rotate-180" : ""
                  }`}
                />
              </button>

              {/* Dropdown */}
              <div
                className={`
                  absolute right-0 mt-2 w-56 overflow-hidden rounded-2xl
                  border border-white/10 bg-black/80 backdrop-blur-xl
                  shadow-[0_12px_40px_-18px_rgba(0,0,0,0.8)]
                  transition-all duration-200
                  ${
                    open
                      ? "opacity-100 translate-y-0"
                      : "pointer-events-none opacity-0 -translate-y-1"
                  }
                `}
              >
                <button
                  onClick={() => {
                    setOpen(false);
                    router.push(`/${session.user?.username}`);
                  }}
                  className="
                    w-full flex items-center gap-2 px-4 py-3 text-sm
                    text-slate-200 hover:bg-white/5 transition
                  "
                >
                  <User2 className="h-4 w-4 text-slate-400" />
                  Profile
                </button>

                <div className="h-px bg-white/10" />

                <button
                  onClick={() => signOut()}
                  className="
                    w-full flex items-center gap-2 px-4 py-3 text-sm
                    text-red-300 hover:bg-red-500/10 transition
                  "
                >
                  <LogOut className="h-4 w-4" />
                  Sign out
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Search */}
        <div className="sm:hidden border-t border-white/10 px-4 py-3">
          <form
            onSubmit={handleSubmit}
            className="
              flex items-center gap-2 rounded-2xl
              bg-white/5 px-4 py-2.5
              border border-white/10
              focus-within:border-cyan-300/40
              focus-within:bg-white/[0.07]
              transition
            "
          >
            <Search className="h-4 w-4 text-slate-400" />
            <input
              className="
                w-full bg-transparent text-sm text-white
                placeholder:text-slate-500 outline-none
              "
              placeholder="Search username..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </form>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
