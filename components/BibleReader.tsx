"use client";

import { useEffect, useState } from "react";
import { BibleChapter, BIBLE_VERSIONS, CHAPTER_COUNTS, BIBLE_BOOKS } from "@/lib/types";
import { fetchChapter } from "@/lib/bible";
import { BookChapterPicker } from "./BookChapterPicker";

interface Props {
  book: string;
  chapter: number;
  version: string;
  selectedVerse: number | null;
  onVerseSelect: (verse: number | null) => void;
  onNavigate: (book: string, chapter: number) => void;
  onVersionChange: (version: string) => void;
}

export function BibleReader({
  book,
  chapter,
  version,
  selectedVerse,
  onVerseSelect,
  onNavigate,
  onVersionChange,
}: Props) {
  const [bibleData, setBibleData] = useState<BibleChapter | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetchChapter(book, chapter, version)
      .then((data) => {
        setBibleData(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [book, chapter, version]);

  function prevChapter() {
    if (chapter > 1) {
      onNavigate(book, chapter - 1);
    } else {
      const idx = BIBLE_BOOKS.indexOf(book);
      if (idx > 0) {
        const prevBook = BIBLE_BOOKS[idx - 1];
        onNavigate(prevBook, CHAPTER_COUNTS[prevBook] || 1);
      }
    }
  }

  function nextChapter() {
    const maxChap = CHAPTER_COUNTS[book] || 1;
    if (chapter < maxChap) {
      onNavigate(book, chapter + 1);
    } else {
      const idx = BIBLE_BOOKS.indexOf(book);
      if (idx < BIBLE_BOOKS.length - 1) {
        onNavigate(BIBLE_BOOKS[idx + 1], 1);
      }
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <BookChapterPicker book={book} chapter={chapter} onChange={onNavigate} />
          {/* Version selector */}
          <div className="flex items-center gap-1.5">
            {Object.keys(BIBLE_VERSIONS).map((v) => (
              <button
                key={v}
                onClick={() => onVersionChange(v)}
                className={`px-2.5 py-0.5 rounded-full text-xs font-semibold transition-colors ${
                  v === version
                    ? "text-white"
                    : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                }`}
                style={v === version ? { backgroundColor: BIBLE_VERSIONS[v].color } : {}}
              >
                {BIBLE_VERSIONS[v].label}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={prevChapter}
            className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={nextChapter}
            className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6 py-5">
        {loading && (
          <div className="space-y-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-4 bg-gray-100 rounded animate-pulse" style={{ width: `${70 + (i % 3) * 10}%` }} />
            ))}
          </div>
        )}

        {error && (
          <div className="text-sm text-red-500 bg-red-50 rounded-lg p-4">
            Failed to load: {error}
          </div>
        )}

        {!loading && !error && bibleData && (
          <div className="space-y-1">
            {bibleData.verses.map(({ verse, text }) => (
              <div
                key={verse}
                onClick={() => onVerseSelect(selectedVerse === verse ? null : verse)}
                className={`group flex gap-3 px-3 py-2 rounded-xl cursor-pointer transition-colors ${
                  selectedVerse === verse
                    ? "bg-blue-50 ring-1 ring-blue-200"
                    : "hover:bg-gray-50"
                }`}
              >
                <span className="text-xs font-bold text-gray-400 pt-0.5 w-5 flex-shrink-0 group-hover:text-blue-500 transition-colors">
                  {verse}
                </span>
                <p className="text-gray-800 text-[15px] leading-relaxed">{text}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedVerse && (
        <div className="px-6 py-3 border-t border-gray-100 bg-blue-50">
          <p className="text-xs text-blue-600 font-medium">
            Verse {selectedVerse} selected — add a comment in the discussion panel
          </p>
        </div>
      )}
    </div>
  );
}
