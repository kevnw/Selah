"use client";

import { useEffect, useRef } from "react";
import { Discussion } from "./Discussion";
import { Message } from "@/lib/types";

interface Props {
  open: boolean;
  onClose: () => void;
  messages: Message[];
  currentUserId: string;
  selectedVerse: number | null;
  filterVerse: number | null;
  onFilterVerse: (verse: number | null) => void;
  onSend: (content: string, verseRef?: string) => void;
  loading?: boolean;
}

export function DiscussionSheet({
  open, onClose, messages, currentUserId,
  selectedVerse, filterVerse, onFilterVerse, onSend, loading,
}: Props) {
  const sheetRef = useRef<HTMLDivElement>(null);

  // Lock body scroll when sheet is open
  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-40 bg-black/30 transition-opacity duration-300 md:hidden ${
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />

      {/* Sheet */}
      <div
        ref={sheetRef}
        className={`fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-2xl shadow-2xl transition-transform duration-300 ease-out md:hidden flex flex-col`}
        style={{
          height: "75vh",
          transform: open ? "translateY(0)" : "translateY(100%)",
        }}
      >
        {/* Handle + header */}
        <div className="flex-shrink-0 pt-3 pb-0">
          <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-3" />
          <div className="flex items-center justify-between px-5 pb-3 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">Discussion</h2>
            <button
              onClick={onClose}
              className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Discussion content — hide the built-in header since we have our own */}
        <div className="flex-1 min-h-0 overflow-hidden">
          <Discussion
            messages={messages}
            currentUserId={currentUserId}
            selectedVerse={selectedVerse}
            filterVerse={filterVerse}
            onFilterVerse={onFilterVerse}
            onSend={onSend}
            loading={loading}
            hideHeader
          />
        </div>
      </div>
    </>
  );
}
