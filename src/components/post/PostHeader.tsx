"use client";

import { Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";

interface PostHeaderProps {
  badge: string;
  title: string;
  subtitle: string;
}

export default function PostHeader({
  badge,
  title,
  subtitle,
}: PostHeaderProps) {
  const router = useRouter();

  return (
    <div className="flex items-start justify-between">
      <div>
        <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs tracking-wide text-slate-300">
          <Sparkles className="h-4 w-4 text-cyan-300" />
          {badge}
        </div>

        <h1 className="mt-5 text-3xl font-semibold tracking-tight">
          {title}
        </h1>

        <p className="mt-2 text-sm text-slate-400">
          {subtitle}
        </p>
      </div>

      <button
        onClick={() => router.back()}
        className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300 transition hover:bg-white/10 active:scale-95"
      >
        Cancel
      </button>
    </div>
  );
}
