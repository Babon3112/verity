"use client";

import { useEffect, useRef } from "react";

interface Props {
  value: string;
  onChange: (val: string) => void;
  maxLength?: number;
  placeholder?: string;
  showHint?: boolean;
}

export default function AutoResizeTextarea({
  value,
  onChange,
  maxLength = 1000,
  placeholder,
  showHint = false,
}: Props) {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const resize = () => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = el.scrollHeight + "px";
  };

  useEffect(() => {
    resize();
  }, []);

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
    resize();
  };

  return (
    <div className="mt-10 rounded-3xl border border-white/10 bg-white/5 p-6 transition focus-within:border-cyan-400/40 focus-within:bg-white/[0.07]">
      <textarea
        ref={textareaRef}
        value={value}
        onChange={handleInput}
        maxLength={maxLength}
        rows={1}
        placeholder={placeholder}
        className="w-full resize-none overflow-hidden bg-transparent text-base leading-relaxed outline-none placeholder:text-slate-500 min-h-20"
      />

      <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
        {showHint && (
          <span>
            {value.trim().length === 0
              ? "Clarity beats noise."
              : "This looks good."}
          </span>
        )}
        <span>{value.length}/{maxLength}</span>
      </div>
    </div>
  );
}
