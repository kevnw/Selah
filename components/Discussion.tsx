"use client";

import { useEffect, useRef, useState } from "react";
import { Message } from "@/lib/types";
import { UserAvatar } from "./UserAvatar";

interface Props {
  messages: Message[];
  currentUserId: string;
  selectedVerse: number | null;
  filterVerse: number | null;
  onFilterVerse: (verse: number | null) => void;
  onSend: (content: string, verseRef?: string) => void;
  loading?: boolean;
  hideHeader?: boolean;
}

function timeAgo(dateStr: string): string {
  const diff = (Date.now() - new Date(dateStr).getTime()) / 1000;
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return new Date(dateStr).toLocaleDateString();
}

export function Discussion({
  messages,
  currentUserId,
  selectedVerse,
  filterVerse,
  onFilterVerse,
  onSend,
  loading,
  hideHeader,
}: Props) {
  const [input, setInput] = useState("");
  const [attachVerse, setAttachVerse] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  const filtered = filterVerse
    ? messages.filter((m) => m.verse_ref === String(filterVerse))
    : messages;

  function handleSend() {
    const trimmed = input.trim();
    if (!trimmed) return;
    const verseRef = selectedVerse && attachVerse ? String(selectedVerse) : undefined;
    onSend(trimmed, verseRef);
    setInput("");
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      {!hideHeader && (
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">Discussion</h2>
          <button
            onClick={() => onFilterVerse(null)}
            className={`text-xs font-medium transition-colors ${
              filterVerse ? "text-blue-600 hover:text-blue-700" : "text-gray-400"
            }`}
          >
            {filterVerse ? `Verse ${filterVerse} ×` : "all verses"}
          </button>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
        {loading && (
          <div className="flex items-center justify-center h-full">
            <div className="text-sm text-gray-400">Loading discussion...</div>
          </div>
        )}

        {!loading && filtered.length === 0 && (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="text-gray-300 text-4xl mb-3">💬</div>
              <p className="text-sm text-gray-400">
                {filterVerse
                  ? `No comments on verse ${filterVerse} yet`
                  : "Be the first to share a reflection"}
              </p>
            </div>
          </div>
        )}

        {!loading &&
          filtered.map((msg) => {
            const isOwn = msg.user_id === currentUserId;
            return (
              <div key={msg.id} className={`flex gap-3 ${isOwn ? "flex-row-reverse" : ""}`}>
                <UserAvatar name={msg.user_name} color={msg.user_color} size="sm" />
                <div className={`flex-1 max-w-[75%] ${isOwn ? "items-end" : "items-start"} flex flex-col gap-1`}>
                  <div className={`flex items-center gap-2 ${isOwn ? "flex-row-reverse" : ""}`}>
                    <span className="text-xs font-semibold text-gray-600">{msg.user_name}</span>
                    {msg.verse_ref && (
                      <button
                        onClick={() => onFilterVerse(Number(msg.verse_ref))}
                        className="text-xs px-1.5 py-0.5 rounded bg-blue-100 text-blue-600 font-medium hover:bg-blue-200 transition-colors"
                      >
                        v.{msg.verse_ref}
                      </button>
                    )}
                    <span className="text-xs text-gray-400">{timeAgo(msg.created_at)}</span>
                  </div>
                  <div
                    className={`px-3.5 py-2.5 rounded-2xl text-sm text-gray-800 leading-relaxed ${
                      isOwn
                        ? "bg-blue-600 text-white rounded-tr-sm"
                        : "bg-gray-100 rounded-tl-sm"
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              </div>
            );
          })}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-5 py-4 border-t border-gray-100">
        {selectedVerse && (
          <div className="flex items-center gap-2 mb-2">
            <button
              onClick={() => setAttachVerse(!attachVerse)}
              className={`flex items-center gap-1.5 text-xs px-2 py-1 rounded-full transition-colors ${
                attachVerse
                  ? "bg-blue-100 text-blue-700 font-medium"
                  : "bg-gray-100 text-gray-500"
              }`}
            >
              <span>{attachVerse ? "✓" : "○"}</span>
              Commenting on verse {selectedVerse}
            </button>
          </div>
        )}
        <div className="flex gap-2">
          <input
            className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400 transition-all"
            placeholder="Share your reflection..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim()}
            className="px-4 py-2.5 bg-gray-900 text-white text-sm font-semibold rounded-xl disabled:opacity-40 hover:bg-gray-700 transition-colors"
          >
            Post
          </button>
        </div>
      </div>
    </div>
  );
}
