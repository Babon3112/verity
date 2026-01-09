"use client";

import { signOut, useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

const Navbar = () => {
  const { data: session } = useSession();
  const router = useRouter();
  const [query, setQuery] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    router.push(`/${query.toLowerCase().trim()}`);
  };

  if (!session) return null;

  return (
    <nav className="sticky top-0 z-50 border-b border-white/5 bg-black/80 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <Link
          href="/"
          className="text-xl font-semibold text-white"
        >
          Verity
        </Link>

        <form
          onSubmit={handleSubmit}
          className="
            flex items-center w-72 rounded-full
            bg-[#0f1115] px-4 py-2
            border border-white/5
            focus-within:border-[#00F7FF]
            transition
          "
        >
          <input
            className="
              w-full bg-transparent text-sm text-white
              placeholder-slate-500 outline-none
            "
            placeholder="Search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button
            type="submit"
            className="ml-2 text-slate-400 hover:text-[#00F7FF] transition"
          >
            ⌕
          </button>
        </form>

        <div className="flex items-center gap-4">
          <Link
            href="/create"
            className="
              rounded-full px-3 py-1 text-sm font-medium text-black
              bg-[#00F7FF]
              hover:brightness-110 transition
            "
          >
            Post
          </Link>

          {session.user?.avatar && (
            <Image
              src={session.user.avatar}
              alt="profile"
              width={32}
              height={32}
              className="
                rounded-full cursor-pointer
                border border-[#B0FFFA]
                hover:border-[#00F7FF] transition
              "
              onClick={() =>
                router.push(`/${session.user.username}`)
              }
            />
          )}

          <button
            onClick={() => signOut()}
            className="
              text-sm text-slate-400
              hover:text-[#B0FFFA] transition
            "
          >
            Sign out
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
