"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { BibleReader } from "@/components/BibleReader";
import { Discussion } from "@/components/Discussion";
import { CompareVersions } from "@/components/CompareVersions";
import { UserAvatarGroup } from "@/components/UserAvatar";
import { useRoom } from "@/hooks/useRoom";
import { getOrCreateSession, UserSession } from "@/lib/session";
import { Presence } from "@/lib/types";

type Tab = "read" | "compare";

export default function RoomPage() {
  const params = useParams();
  const roomId = params.roomId as string;

  const [session, setSession] = useState<UserSession | null>(null);
  const [tab, setTab] = useState<Tab>("read");
  const [book, setBook] = useState("Psalms");
  const [chapter, setChapter] = useState(23);
  const [version, setVersion] = useState("NIV");
  const [selectedVerse, setSelectedVerse] = useState<number | null>(null);
  const [filterVerse, setFilterVerse] = useState<number | null>(null);
  const [roomName, setRoomName] = useState("");

  useEffect(() => {
    const s = getOrCreateSession();
    setSession(s);
    // Derive a friendly room name from ID
    const adj = ["Morning", "Evening", "Daily", "Weekly", "Sunday"];
    const noun = ["Devotion", "Study", "Reflection", "Prayer", "Fellowship"];
    const hash = roomId.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
    setRoomName(`${adj[hash % adj.length]} ${noun[(hash >> 2) % noun.length]}`);
  }, [roomId]);

  const { messages, onlineUsers, sendMessage, loading } = useRoom(roomId, session);

  // Build display users: include self if not in onlineUsers (demo mode)
  const displayUsers = onlineUsers.length > 0
    ? onlineUsers
    : session
    ? [{ user_id: session.userId, user_name: session.userName, user_color: session.userColor, online_at: "" }]
    : [];

  function handleNavigate(newBook: string, newChapter: number) {
    setBook(newBook);
    setChapter(newChapter);
    setSelectedVerse(null);
    setFilterVerse(null);
  }

  return (
    <div className="flex flex-col h-screen bg-white">
      {/* Top nav */}
      <header className="flex items-center justify-between px-6 h-14 border-b border-gray-100 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gray-900 flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <span className="font-bold text-gray-900 text-lg">WordTogether</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-gray-100 text-sm text-gray-600">
            <span>{roomName}</span>
            <span className="text-gray-400">·</span>
            <span className="text-gray-400 font-mono text-xs">#{roomId.slice(0, 4).toUpperCase()}</span>
          </div>
        </div>
        <UserAvatarGroup users={displayUsers} />
      </header>

      {/* Tabs */}
      <div className="flex items-center gap-1 px-6 border-b border-gray-100 flex-shrink-0">
        {(["read", "compare"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-1 py-3 text-sm font-medium border-b-2 transition-colors mr-4 ${
              tab === t
                ? "border-gray-900 text-gray-900"
                : "border-transparent text-gray-400 hover:text-gray-600"
            }`}
          >
            {t === "read" ? "Read & Discuss" : "Compare versions"}
          </button>
        ))}
      </div>

      {/* Main content */}
      <div className="flex flex-1 min-h-0">
        {tab === "read" ? (
          <>
            {/* Bible panel */}
            <div className="flex-1 border-r border-gray-100 min-h-0 overflow-hidden flex flex-col">
              <BibleReader
                book={book}
                chapter={chapter}
                version={version}
                selectedVerse={selectedVerse}
                onVerseSelect={setSelectedVerse}
                onNavigate={handleNavigate}
                onVersionChange={setVersion}
              />
            </div>

            {/* Discussion panel */}
            <div className="w-[380px] flex-shrink-0 min-h-0 overflow-hidden flex flex-col">
              <Discussion
                messages={messages}
                currentUserId={session?.userId || ""}
                selectedVerse={selectedVerse}
                filterVerse={filterVerse}
                onFilterVerse={setFilterVerse}
                onSend={sendMessage}
                loading={loading}
              />
            </div>
          </>
        ) : (
          <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
            <CompareVersions book={book} chapter={chapter} onNavigate={handleNavigate} />
          </div>
        )}
      </div>
    </div>
  );
}
