"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { BibleReader } from "@/components/BibleReader";
import { Discussion } from "@/components/Discussion";
import { CompareVersions } from "@/components/CompareVersions";
import { UserAvatarGroup } from "@/components/UserAvatar";
import { useRoom } from "@/hooks/useRoom";
import { getOrCreateSession, updateSessionName, UserSession } from "@/lib/session";

type Tab = "read" | "compare";
type MobilePane = "bible" | "discussion";

export default function RoomPage() {
  const params = useParams();
  const roomId = params.roomId as string;

  const [session, setSession] = useState<UserSession | null>(null);
  const [showNamePrompt, setShowNamePrompt] = useState(false);
  const [nameInput, setNameInput] = useState("");
  const [tab, setTab] = useState<Tab>("read");
  const [mobilePane, setMobilePane] = useState<MobilePane>("bible");
  const [book, setBook] = useState("Psalms");
  const [chapter, setChapter] = useState(23);
  const [version, setVersion] = useState("NIV");
  const [selectedVerse, setSelectedVerse] = useState<number | null>(null);
  const [filterVerse, setFilterVerse] = useState<number | null>(null);
  const [roomName, setRoomName] = useState("");

  useEffect(() => {
    const s = getOrCreateSession();
    setSession(s);
    // Show name prompt if name looks auto-generated (starts with "User" + digits)
    if (/^User\d+$/.test(s.userName)) {
      setShowNamePrompt(true);
    }
    const adj = ["Morning", "Evening", "Daily", "Weekly", "Sunday"];
    const noun = ["Devotion", "Study", "Reflection", "Prayer", "Fellowship"];
    const hash = roomId.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
    setRoomName(`${adj[hash % adj.length]} ${noun[(hash >> 2) % noun.length]}`);
  }, [roomId]);

  const { messages, onlineUsers, sendMessage, loading } = useRoom(roomId, session);

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

  function handleVerseSelect(verse: number | null) {
    setSelectedVerse(verse);
    // On mobile, switch to discussion when a verse is selected
    if (verse !== null) setMobilePane("discussion");
  }

  function confirmName() {
    const name = nameInput.trim();
    if (!name) return;
    const updated = updateSessionName(name);
    setSession(updated);
    setShowNamePrompt(false);
  }

  return (
    <div className="flex flex-col h-screen bg-white">
      {/* Name prompt modal */}
      {showNamePrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-1">What's your name?</h2>
            <p className="text-sm text-gray-500 mb-4">So others in the room can see who you are.</p>
            <input
              autoFocus
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:ring-2 focus:ring-blue-500 mb-3"
              placeholder="e.g. John Smith"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && confirmName()}
            />
            <button
              onClick={confirmName}
              disabled={!nameInput.trim()}
              className="w-full py-2.5 bg-gray-900 text-white font-semibold rounded-xl disabled:opacity-40 hover:bg-gray-700 transition-colors text-sm"
            >
              Join room
            </button>
          </div>
        </div>
      )}

      {/* Top nav */}
      <header className="flex items-center justify-between px-4 h-14 border-b border-gray-100 flex-shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-7 h-7 rounded-lg bg-gray-900 flex items-center justify-center flex-shrink-0">
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          {/* Hide app name on mobile to save space */}
          <span className="font-bold text-gray-900 text-lg hidden sm:block">Selah</span>
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-gray-100 text-xs text-gray-600 min-w-0">
            <span className="truncate max-w-[100px] sm:max-w-none">{roomName}</span>
            <span className="text-gray-400">·</span>
            <span className="text-gray-400 font-mono">#{roomId.slice(0, 4).toUpperCase()}</span>
          </div>
        </div>
        <UserAvatarGroup users={displayUsers} />
      </header>

      {/* Tabs (top-level: Read & Discuss / Compare versions) */}
      <div className="flex items-center px-4 border-b border-gray-100 flex-shrink-0">
        {(["read", "compare"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-1 py-3 text-sm font-medium border-b-2 transition-colors mr-5 ${
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
            {/* ── Desktop: side by side ── */}
            <div className="hidden md:flex flex-1 min-h-0">
              <div className="flex-1 border-r border-gray-100 min-h-0 overflow-hidden flex flex-col">
                <BibleReader
                  book={book} chapter={chapter} version={version}
                  selectedVerse={selectedVerse}
                  onVerseSelect={setSelectedVerse}
                  onNavigate={handleNavigate}
                  onVersionChange={setVersion}
                />
              </div>
              <div className="w-[380px] flex-shrink-0 min-h-0 overflow-hidden flex flex-col">
                <Discussion
                  messages={messages} currentUserId={session?.userId || ""}
                  selectedVerse={selectedVerse} filterVerse={filterVerse}
                  onFilterVerse={setFilterVerse} onSend={sendMessage} loading={loading}
                />
              </div>
            </div>

            {/* ── Mobile: toggle between Bible and Discussion ── */}
            <div className="flex flex-col flex-1 min-h-0 md:hidden">
              {/* Mobile pane toggle */}
              <div className="flex border-b border-gray-100 flex-shrink-0">
                <button
                  onClick={() => setMobilePane("bible")}
                  className={`flex-1 py-2.5 text-sm font-medium transition-colors ${
                    mobilePane === "bible"
                      ? "text-gray-900 border-b-2 border-gray-900"
                      : "text-gray-400"
                  }`}
                >
                  Bible
                </button>
                <button
                  onClick={() => setMobilePane("discussion")}
                  className={`flex-1 py-2.5 text-sm font-medium transition-colors relative ${
                    mobilePane === "discussion"
                      ? "text-gray-900 border-b-2 border-gray-900"
                      : "text-gray-400"
                  }`}
                >
                  Discussion
                  {messages.length > 0 && mobilePane !== "discussion" && (
                    <span className="ml-1.5 inline-flex items-center justify-center w-4 h-4 rounded-full bg-blue-600 text-white text-[10px] font-bold">
                      {messages.length > 9 ? "9+" : messages.length}
                    </span>
                  )}
                </button>
              </div>

              {mobilePane === "bible" ? (
                <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
                  <BibleReader
                    book={book} chapter={chapter} version={version}
                    selectedVerse={selectedVerse}
                    onVerseSelect={handleVerseSelect}
                    onNavigate={handleNavigate}
                    onVersionChange={setVersion}
                  />
                </div>
              ) : (
                <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
                  <Discussion
                    messages={messages} currentUserId={session?.userId || ""}
                    selectedVerse={selectedVerse} filterVerse={filterVerse}
                    onFilterVerse={setFilterVerse} onSend={sendMessage} loading={loading}
                  />
                </div>
              )}
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
