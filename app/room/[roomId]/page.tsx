"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { BibleReader } from "@/components/BibleReader";
import { Discussion } from "@/components/Discussion";
import { DiscussionSheet } from "@/components/DiscussionSheet";
import { CompareVersions } from "@/components/CompareVersions";
import { UserAvatarGroup } from "@/components/UserAvatar";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useRoom } from "@/hooks/useRoom";
import { getOrCreateSession, updateSessionName, UserSession } from "@/lib/session";
import { VerseRange } from "@/lib/types";

type Tab = "read" | "compare";

export default function RoomPage() {
  const params = useParams();
  const roomId = params.roomId as string;

  const [session, setSession] = useState<UserSession | null>(null);
  const [showNamePrompt, setShowNamePrompt] = useState(false);
  const [nameInput, setNameInput] = useState("");
  const [tab, setTab] = useState<Tab>("read");
  const [sheetOpen, setSheetOpen] = useState(false);
  const [book, setBook] = useState("Psalms");
  const [chapter, setChapter] = useState(23);
  const [version, setVersion] = useState("NIV");
  const [selectedVerse, setSelectedVerse] = useState<VerseRange | null>(null);
  const [filterVerse, setFilterVerse] = useState<string | null>(null);
  const [roomName, setRoomName] = useState("");

  useEffect(() => {
    const s = getOrCreateSession();
    setSession(s);
    if (/^User\d+$/.test(s.userName)) setShowNamePrompt(true);
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

  const verseCommentCounts = useMemo(() => {
    const counts: Record<number, number> = {};
    const prefix = `${book} ${chapter}:`;
    messages.forEach((m) => {
      if (!m.verse_ref?.startsWith(prefix)) return;
      const verseStr = m.verse_ref.split(":")[1];
      if (verseStr.includes("-")) {
        const [s, e] = verseStr.split("-").map(Number);
        for (let v = s; v <= e; v++) counts[v] = (counts[v] || 0) + 1;
      } else {
        const v = Number(verseStr);
        counts[v] = (counts[v] || 0) + 1;
      }
    });
    return counts;
  }, [messages, book, chapter]);

  function handleNavigate(newBook: string, newChapter: number) {
    setBook(newBook); setChapter(newChapter); setSelectedVerse(null); setFilterVerse(null);
  }

  function handleVerseSelect(range: VerseRange | null) {
    setSelectedVerse(range);
    if (range !== null) {
      const verseStr = range.start === range.end ? `${range.start}` : `${range.start}-${range.end}`;
      setFilterVerse(`${book} ${chapter}:${verseStr}`);
      setSheetOpen(true);
    }
  }

  function confirmName() {
    const name = nameInput.trim();
    if (!name) return;
    setSession(updateSessionName(name));
    setShowNamePrompt(false);
  }

  return (
    <div className="flex flex-col h-screen bg-white dark:bg-gray-950">
      {/* Name prompt */}
      {showNamePrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl w-full max-w-sm p-6">
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-1">What's your name?</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">So others in the room can see who you are.</p>
            <input
              autoFocus
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm outline-none focus:ring-2 focus:ring-blue-500 mb-3"
              placeholder="e.g. John Smith"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && confirmName()}
            />
            <button
              onClick={confirmName}
              disabled={!nameInput.trim()}
              className="w-full py-2.5 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 font-semibold rounded-xl disabled:opacity-40 hover:bg-gray-700 dark:hover:bg-gray-300 transition-colors text-sm"
            >
              Join room
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="flex items-center justify-between px-4 h-14 border-b border-gray-100 dark:border-gray-800 flex-shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-7 h-7 rounded-lg bg-gray-900 dark:bg-gray-100 flex items-center justify-center flex-shrink-0">
            <svg className="w-4 h-4 text-white dark:text-gray-900" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <span className="font-bold text-gray-900 dark:text-gray-100 text-lg hidden sm:block">Selah</span>
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-xs text-gray-600 dark:text-gray-400 min-w-0">
            <span className="truncate max-w-[100px] sm:max-w-none">{roomName}</span>
            <span className="text-gray-400 dark:text-gray-600">·</span>
            <span className="text-gray-400 dark:text-gray-500 font-mono">#{roomId.slice(0, 4).toUpperCase()}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <UserAvatarGroup users={displayUsers} />
        </div>
      </header>

      {/* Tabs */}
      <div className="flex items-center px-4 border-b border-gray-100 dark:border-gray-800 flex-shrink-0">
        {(["read", "compare"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-1 py-3 text-sm font-medium border-b-2 transition-colors mr-5 ${
              tab === t
                ? "border-gray-900 dark:border-gray-100 text-gray-900 dark:text-gray-100"
                : "border-transparent text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
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
            <div className="hidden md:flex flex-1 min-h-0">
              <div className="flex-1 border-r border-gray-100 dark:border-gray-800 min-h-0 overflow-hidden flex flex-col">
                <BibleReader
                  book={book} chapter={chapter} version={version}
                  selectedVerse={selectedVerse} verseCommentCounts={verseCommentCounts}
                  onVerseSelect={(range) => { setSelectedVerse(range); if (range) { const vs = range.start === range.end ? `${range.start}` : `${range.start}-${range.end}`; setFilterVerse(`${book} ${chapter}:${vs}`); } else { setFilterVerse(null); } }} onNavigate={handleNavigate}
                  onVersionChange={setVersion} onOpenDiscussion={() => {}} totalComments={messages.length}
                />
              </div>
              <div className="w-[380px] flex-shrink-0 min-h-0 overflow-hidden flex flex-col">
                <Discussion
                  messages={messages} currentUserId={session?.userId || ""}
                  book={book} chapter={chapter}
                  selectedVerse={selectedVerse} filterVerse={filterVerse}
                  onFilterVerse={setFilterVerse} onSend={sendMessage} onNavigate={handleNavigate} loading={loading}
                />
              </div>
            </div>
            <div className="flex flex-1 min-h-0 md:hidden relative">
              <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
                <BibleReader
                  book={book} chapter={chapter} version={version}
                  selectedVerse={selectedVerse} verseCommentCounts={verseCommentCounts}
                  onVerseSelect={handleVerseSelect} onNavigate={handleNavigate}
                  onVersionChange={setVersion} onOpenDiscussion={() => setSheetOpen(true)} totalComments={messages.length}
                />
              </div>
              <DiscussionSheet
                open={sheetOpen} onClose={() => setSheetOpen(false)}
                messages={messages} currentUserId={session?.userId || ""}
                book={book} chapter={chapter}
                selectedVerse={selectedVerse} filterVerse={filterVerse}
                onFilterVerse={setFilterVerse} onSend={sendMessage} onNavigate={handleNavigate} loading={loading}
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
