"use client";

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
  const displayed = users.slice(0, 4);

  return (
    <div className="flex items-center gap-2">
      <div className="flex -space-x-1">
        {displayed.map((u) => (
          <UserAvatar key={u.user_id} name={u.user_name} color={u.user_color} size="md" />
        ))}
      </div>
      <span className="text-sm text-gray-500">
        {users.length} online
      </span>
    </div>
  );
}
