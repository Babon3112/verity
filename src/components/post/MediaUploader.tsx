"use client";

import { ImagePlus } from "lucide-react";

interface Props {
  total: number;
  max: number;
  onAdd: (files: File[]) => void;
}

export default function MediaUploader({ total, max, onAdd }: Props) {
  return (
    <label
      className={`group relative flex flex-col gap-1 rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-sm transition ${
        total >= max
          ? "opacity-40 cursor-not-allowed"
          : "cursor-pointer hover:bg-white/8"
      }`}
    >
      <div className="flex items-center gap-2">
        <ImagePlus className="h-4 w-4 text-cyan-300" />
        Add media
      </div>

      <span className="text-xs text-slate-400">
        {total}/{max}
      </span>

      <input
        type="file"
        accept="image/*,video/*"
        multiple
        disabled={total >= max}
        onChange={(e) => {
          const files = Array.from(e.target.files || []);
          onAdd(files);
        }}
        className="hidden"
      />
    </label>
  );
}
