"use client";

import { useEffect, useState } from "react";
import { BibleChapter, BIBLE_VERSIONS, BIBLE_BOOKS, CHAPTER_COUNTS } from "@/lib/types";
import { fetchChapter } from "@/lib/bible";
import { BookChapterPicker } from "./BookChapterPicker";

interface Props {
  book: string;
  chapter: number;
  onNavigate: (book: string, chapter: number) => void;
}

const VERSION_KEYS = Object.keys(BIBLE_VERSIONS);

export function CompareVersions({ book, chapter, onNavigate }: Props) {
  const [selectedVersions, setSelectedVersions] = useState<string[]>(["NIV", "TB"]);
  const [chapterData, setChapterData] = useState<Record<string, BibleChapter>>({});
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [highlightVerse, setHighlightVerse] = useState<number | null>(null);

  useEffect(() => {
    selectedVersions.forEach((v) => {
      if (!chapterData[`${v}-${book}-${chapter}`]) {
        setLoading((prev) => ({ ...prev, [v]: true }));
        fetchChapter(book, chapter, v)
          .then((data) => {
            setChapterData((prev) => ({ ...prev, [`${v}-${book}-${chapter}`]: data }));
            setLoading((prev) => ({ ...prev, [v]: false }));
          })
          .catch((err) => {
            setErrors((prev) => ({ ...prev, [v]: err.message }));
            setLoading((prev) => ({ ...prev, [v]: false }));
          });
      }
    });
  }, [selectedVersions, book, chapter]);

  function toggleVersion(v: string) {
    setSelectedVersions((prev) =>
      prev.includes(v)
        ? prev.length > 1 ? prev.filter((x) => x !== v) : prev
        : [...prev, v]
    );
  }

  // Get max verse count
  const allVerses = selectedVersions.flatMap((v) => {
    const data = chapterData[`${v}-${book}-${chapter}`];
    return data?.verses.map((ver) => ver.verse) || [];
  });
  const maxVerse = allVerses.length > 0 ? Math.max(...allVerses) : 0;

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-950">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-center justify-between mb-3">
          <BookChapterPicker book={book} chapter={chapter} onChange={onNavigate} />
          <div className="flex items-center gap-2">
            <button
              onClick={() => { if (chapter > 1) { onNavigate(book, chapter-1); } else { const idx = BIBLE_BOOKS.indexOf(book); if (idx > 0) { const prev = BIBLE_BOOKS[idx-1]; onNavigate(prev, CHAPTER_COUNTS[prev]||1); } } }}
              className="w-8 h-8 rounded-lg border border-gray-200 dark:border-gray-700 flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-gray-600 dark:text-gray-400"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            </button>
            <button
              onClick={() => { const max = CHAPTER_COUNTS[book]||1; if (chapter < max) { onNavigate(book, chapter+1); } else { const idx = BIBLE_BOOKS.indexOf(book); if (idx < BIBLE_BOOKS.length-1) onNavigate(BIBLE_BOOKS[idx+1], 1); } }}
              className="w-8 h-8 rounded-lg border border-gray-200 dark:border-gray-700 flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-gray-600 dark:text-gray-400"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            </button>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {VERSION_KEYS.map((v) => (
            <button
              key={v}
              onClick={() => toggleVersion(v)}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors border ${
                selectedVersions.includes(v)
                  ? "text-white border-transparent"
                  : "bg-white dark:bg-gray-900 text-gray-400 dark:text-gray-500 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
              }`}
              style={selectedVersions.includes(v) ? { backgroundColor: BIBLE_VERSIONS[v].color } : {}}
            >
              {BIBLE_VERSIONS[v].label}
            </button>
          ))}
        </div>
      </div>

      {/* Comparison grid */}
      <div className="flex-1 overflow-auto">
        <div
          className="sticky top-0 z-10 bg-white dark:bg-gray-950 border-b border-gray-100 dark:border-gray-800 grid"
          style={{ gridTemplateColumns: `3rem repeat(${selectedVersions.length}, 1fr)` }}
        >
          <div className="px-2 py-3 text-xs font-bold text-gray-400 dark:text-gray-600 text-center">#</div>
          {selectedVersions.map((v) => (
            <div key={v} className="px-4 py-3 text-sm font-bold" style={{ color: BIBLE_VERSIONS[v].color }}>
              {BIBLE_VERSIONS[v].label}
            </div>
          ))}
        </div>

        {maxVerse > 0 && Array.from({ length: maxVerse }, (_, i) => i + 1).map((verseNum) => (
          <div
            key={verseNum}
            onClick={() => setHighlightVerse(highlightVerse === verseNum ? null : verseNum)}
            className={`grid border-b cursor-pointer transition-colors ${
              highlightVerse === verseNum
                ? "bg-amber-50 dark:bg-amber-900/20 border-amber-100 dark:border-amber-900/30"
                : "border-gray-50 dark:border-gray-800/60 hover:bg-gray-50 dark:hover:bg-gray-800/40"
            }`}
            style={{ gridTemplateColumns: `3rem repeat(${selectedVersions.length}, 1fr)` }}
          >
            <div className="px-2 py-3 text-xs font-bold text-gray-400 dark:text-gray-600 text-center pt-3.5">{verseNum}</div>
            {selectedVersions.map((v) => {
              const data = chapterData[`${v}-${book}-${chapter}`];
              const verseData = data?.verses.find((vv) => vv.verse === verseNum);
              return (
                <div key={v} className="px-4 py-3 text-[13px] text-gray-700 dark:text-gray-300 leading-relaxed border-l border-gray-100 dark:border-gray-800">
                  {loading[v] && <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded animate-pulse w-3/4" />}
                  {errors[v] && <span className="text-red-400 text-xs">Error</span>}
                  {verseData?.text}
                  {!loading[v] && !errors[v] && !verseData && <span className="text-gray-300 dark:text-gray-700">—</span>}
                </div>
              );
            })}
          </div>
        ))}

        {maxVerse === 0 && (
          <div className="p-8 text-center text-sm text-gray-400 dark:text-gray-500">
            {Object.values(loading).some(Boolean) ? "Loading translations..." : "Select versions above to compare"}
          </div>
        )}
      </div>
    </div>
  );
}
