"use client";

const PostCardSkeleton = () => {
  return (
    <article className="animate-pulse overflow-hidden rounded-3xl border border-white/10 bg-[#0F1718] shadow-[0_0_0_1px_rgba(255,255,255,0.04)]">
      <div className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-full bg-white/10 ring-1 ring-white/10" />
            <div>
              <div className="h-4 w-32 rounded bg-white/10" />
              <div className="mt-2 h-3 w-28 rounded bg-white/10" />
            </div>
          </div>

          <div className="h-9 w-9 rounded-xl bg-white/10" />
        </div>

        {/* Content */}
        <div className="mt-4 space-y-2">
          <div className="h-3 w-full rounded bg-white/10" />
          <div className="h-3 w-[92%] rounded bg-white/10" />
          <div className="h-3 w-[70%] rounded bg-white/10" />
        </div>

        {/* Media */}
        <div className="mt-4 overflow-hidden rounded-2xl border border-white/10 bg-white/5">
          <div className="aspect-square w-full bg-white/10" />
        </div>

        {/* Actions */}
        <div className="mt-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-10 w-28 rounded-2xl bg-white/10" />
            <div className="h-10 w-36 rounded-2xl bg-white/10" />
          </div>

          <div className="h-10 w-28 rounded-2xl bg-white/10" />
        </div>
      </div>
    </article>
  );
};

export default PostCardSkeleton;
