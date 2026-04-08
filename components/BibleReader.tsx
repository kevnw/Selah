"use client";

import { useEffect, useState } from "react";
import { BibleChapter, BIBLE_VERSIONS, CHAPTER_COUNTS, BIBLE_BOOKS, VerseRange } from "@/lib/types";
import { fetchChapter, prefetchChapters } from "@/lib/bible";
import { BookChapterPicker } from "./BookChapterPicker";

interface Props {
  book: string;
  chapter: number;
  version: string;
  selectedVerse: VerseRange | null;
  verseCommentCounts: Record<number, number>;
  onVerseSelect: (range: VerseRange | null) => void;
  onNavigate: (book: string, chapter: number) => void;
  onVersionChange: (version: string) => void;
  onOpenDiscussion: () => void;
  totalComments: number;
}

export function BibleReader({
  book, chapter, version, selectedVerse, verseCommentCounts,
  onVerseSelect, onNavigate, onVersionChange, onOpenDiscussion, totalComments,
}: Props) {
  const [bibleData, setBibleData] = useState<BibleChapter | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetchChapter(book, chapter, version)
      .then((data) => { setBibleData(data); setLoading(false); prefetchChapters(book, chapter, version); })
      .catch((err) => { setError(err.message); setLoading(false); });
  }, [book, chapter, version]);

  function prevChapter() {
    if (chapter > 1) { onNavigate(book, chapter - 1); }
    else { const idx = BIBLE_BOOKS.indexOf(book); if (idx > 0) { const p = BIBLE_BOOKS[idx-1]; onNavigate(p, CHAPTER_COUNTS[p]||1); } }
  }
  function nextChapter() {
    const max = CHAPTER_COUNTS[book]||1;
    if (chapter < max) { onNavigate(book, chapter+1); }
    else { const idx = BIBLE_BOOKS.indexOf(book); if (idx < BIBLE_BOOKS.length-1) onNavigate(BIBLE_BOOKS[idx+1], 1); }
  }

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-950">
      {/* Header */}
      <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <BookChapterPicker book={book} chapter={chapter} onChange={onNavigate} />
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
            {Object.keys(BIBLE_VERSIONS).map((v) => (
              <button
                key={v}
                onClick={() => onVersionChange(v)}
                className={`px-2 py-0.5 rounded-full text-xs font-semibold transition-colors flex-shrink-0 ${
                  v === version ? "text-white" : "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
                }`}
                style={v === version ? { backgroundColor: BIBLE_VERSIONS[v].color } : {}}
              >
                {BIBLE_VERSIONS[v].label}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <button onClick={prevChapter} className="w-8 h-8 rounded-lg border border-gray-200 dark:border-gray-700 flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-gray-600 dark:text-gray-400">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          </button>
          <button onClick={nextChapter} className="w-8 h-8 rounded-lg border border-gray-200 dark:border-gray-700 flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-gray-600 dark:text-gray-400">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4">
        {loading && (
          <div className="space-y-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-4 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" style={{ width: `${70+(i%3)*10}%` }} />
            ))}
          </div>
        )}
        {error && <div className="text-sm text-red-500 bg-red-50 dark:bg-red-900/20 rounded-lg p-4">Failed to load: {error}</div>}
        {!loading && !error && bibleData && (
          <div className="space-y-0.5">
            {bibleData.verses.map(({ verse, text }) => {
              const commentCount = verseCommentCounts[verse] || 0;
              const isSelected = selectedVerse ? verse >= selectedVerse.start && verse <= selectedVerse.end : false;
              const isRangeEdge = selectedVerse && (verse === selectedVerse.start || verse === selectedVerse.end);
              const hasComments = commentCount > 0;
              return (
                <div
                  key={verse}
                  onClick={() => {
                    if (isSelected) {
                      onVerseSelect(null);
                    } else if (selectedVerse) {
                      onVerseSelect({ start: Math.min(selectedVerse.start, verse), end: Math.max(selectedVerse.end, verse) });
                    } else {
                      onVerseSelect({ start: verse, end: verse });
                    }
                  }}
                  className={`group flex gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-colors ${
                    isRangeEdge
                      ? "bg-blue-50 dark:bg-blue-900/25 ring-1 ring-blue-200 dark:ring-blue-800"
                      : isSelected
                      ? "bg-blue-50/60 dark:bg-blue-900/15"
                      : hasComments
                      ? "hover:bg-amber-50 dark:hover:bg-amber-900/20"
                      : "hover:bg-gray-50 dark:hover:bg-gray-800/60"
                  }`}
                >
                  <div className="flex flex-col items-center gap-1 w-5 flex-shrink-0 pt-0.5">
                    <span className={`text-xs font-bold transition-colors ${
                      isSelected ? "text-blue-500" : hasComments ? "text-amber-500" : "text-gray-400 dark:text-gray-600 group-hover:text-blue-400"
                    }`}>{verse}
                    </span>
                    {hasComments && (
                      <div className="flex items-center gap-0.5">
                        <div className="w-1 h-1 rounded-full bg-amber-400" />
                        {commentCount > 1 && <span className="text-[9px] font-bold text-amber-500 leading-none">{commentCount}</span>}
                      </div>
                    )}
                  </div>
                  <p className={`flex-1 text-[15px] leading-relaxed ${
                    isSelected ? "text-gray-900 dark:text-gray-100" : "text-gray-800 dark:text-gray-200"
                  }`}>{text}</p>
                </div>
              );
            })}
          </div>
        )}
        <div className="h-20 md:h-0" />
      </div>

      {/* Mobile: floating Discussion button */}
      <div className="md:hidden absolute bottom-4 left-0 right-0 flex justify-center pointer-events-none">
        <button
          onClick={onOpenDiscussion}
          className="pointer-events-auto flex items-center gap-2 px-5 py-3 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 rounded-full shadow-lg text-sm font-semibold hover:bg-gray-700 dark:hover:bg-gray-300 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          Discussion
          {totalComments > 0 && (
            <span className="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
              {totalComments > 99 ? "99+" : totalComments}
            </span>
          )}
        </button>
      </div>
    </div>
  );
}
