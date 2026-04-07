"use client";

import { useEffect, useRef, useState } from "react";
import { getInitials } from "@/lib/session";

interface UserAvatarProps {
  name: string;
  color: string;
  size?: "sm" | "md";
}

export function UserAvatar({ name, color, size = "md" }: UserAvatarProps) {
  const dim = size === "sm" ? "w-7 h-7 text-xs" : "w-9 h-9 text-sm";
  return (
    <div
      className={`${dim} rounded-full flex items-center justify-center font-semibold text-white ring-2 ring-white flex-shrink-0`}
      style={{ backgroundColor: color }}
      title={name}
    >
      {getInitials(name)}
    </div>
  );
}

interface UserAvatarGroupProps {
  users: Array<{ user_id: string; user_name: string; user_color: string }>;
}

export function UserAvatarGroup({ users }: UserAvatarGroupProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const displayed = users.slice(0, 4);
  const extra = users.length - displayed.length;

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-xl px-2 py-1 hover:bg-gray-100 transition-colors"
      >
        <div className="flex -space-x-1">
          {displayed.map((u) => (
            <UserAvatar key={u.user_id} name={u.user_name} color={u.user_color} size="md" />
          ))}
          {extra > 0 && (
            <div className="w-9 h-9 rounded-full bg-gray-200 ring-2 ring-white flex items-center justify-center text-xs font-semibold text-gray-600">
              +{extra}
            </div>
          )}
        </div>
        <span className="text-sm text-gray-500">{users.length} online</span>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide px-4 pb-2">
            In this session
          </p>
          <ul>
            {users.map((u) => (
              <li key={u.user_id} className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 transition-colors">
                <UserAvatar name={u.user_name} color={u.user_color} size="sm" />
                <span className="text-sm text-gray-800 font-medium truncate">{u.user_name}</span>
                <span className="ml-auto w-2 h-2 rounded-full bg-green-400 flex-shrink-0" />
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
