"use client";

interface Props {
  hideLikes: boolean;
  disableComments: boolean;
  onToggleLikes: () => void;
  onToggleComments: () => void;
}

export default function PostSettings({
  hideLikes,
  disableComments,
  onToggleLikes,
  onToggleComments,
}: Props) {
  return (
    <div className="mt-8 rounded-3xl border border-white/10 bg-white/5 p-6 space-y-5">
      <ToggleRow
        title="Hide likes count"
        desc="Others won’t see how many likes this post has."
        active={hideLikes}
        onClick={onToggleLikes}
      />

      <ToggleRow
        title="Disable comments"
        desc="No one will be able to comment on this post."
        active={disableComments}
        onClick={onToggleComments}
      />
    </div>
  );
}

const ToggleRow = ({ title, desc, active, onClick }: any) => (
  <button
    type="button"
    onClick={onClick}
    className="flex w-full items-center justify-between rounded-2xl border border-white/10 bg-white/4 px-5 py-4 text-left transition hover:bg-white/8"
  >
    <div>
      <p className="font-medium">{title}</p>
      <p className="text-xs text-slate-400 mt-1">{desc}</p>
    </div>

    <div
      className={`relative h-6 w-12 rounded-full transition ${
        active ? "bg-cyan-400" : "bg-slate-600"
      }`}
    >
      <div
        className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition ${
          active ? "translate-x-6" : "translate-x-0.5"
        }`}
      />
    </div>
  </button>
);
