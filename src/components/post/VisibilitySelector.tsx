"use client";

import { Globe, Users, Lock } from "lucide-react";

type Visibility = "public" | "followers" | "private";

interface Props {
  value: Visibility;
  onChange: (val: Visibility) => void;
}

export default function VisibilitySelector({ value, onChange }: Props) {
  return (
    <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 p-1.5">
      <Button
        active={value === "public"}
        onClick={() => onChange("public")}
        icon={<Globe className="h-4 w-4" />}
        label="Public"
      />
      <Button
        active={value === "followers"}
        onClick={() => onChange("followers")}
        icon={<Users className="h-4 w-4" />}
        label="Followers"
      />
      <Button
        active={value === "private"}
        onClick={() => onChange("private")}
        icon={<Lock className="h-4 w-4" />}
        label="Only me"
      />
    </div>
  );
}

const Button = ({ active, onClick, icon, label }: any) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs transition ${
      active
        ? "bg-white/10 text-cyan-200 border border-cyan-300/30"
        : "text-slate-300 hover:bg-white/5"
    }`}
  >
    {icon}
    {label}
  </button>
);
