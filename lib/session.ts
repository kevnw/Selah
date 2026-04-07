import { USER_COLORS } from "./types";

const SESSION_KEY = "wordtogether_session";

export interface UserSession {
  userId: string;
  userName: string;
  userColor: string;
}

function generateId(): string {
  return Math.random().toString(36).substring(2, 10);
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function getOrCreateSession(preferredName?: string): UserSession {
  if (typeof window === "undefined") {
    return { userId: "ssr", userName: "User", userColor: USER_COLORS[0] };
  }

  const stored = localStorage.getItem(SESSION_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {}
  }

  const session: UserSession = {
    userId: generateId(),
    userName: preferredName || `User${Math.floor(Math.random() * 1000)}`,
    userColor: USER_COLORS[Math.floor(Math.random() * USER_COLORS.length)],
  };

  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  return session;
}

export function updateSessionName(name: string): UserSession {
  const session = getOrCreateSession();
  const updated = { ...session, userName: name };
  localStorage.setItem(SESSION_KEY, JSON.stringify(updated));
  return updated;
}

export { getInitials };
