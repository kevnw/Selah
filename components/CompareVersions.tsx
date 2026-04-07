"use client";

import { useEffect, useState } from "react";
import { BibleChapter, BIBLE_VERSIONS } from "@/lib/types";
import { fetchChapter } from "@/lib/bible";

interface Props {
  book: string;
  chapter: number;
}

const VERSION_KEYS = Object.keys(BIBLE_VERSIONS);

export function CompareVersions({ book, chapter }: Props) {
  const [selectedVersions, setSelectedVersions] = useState<string[]>(["NIV", "KJV", "ESV"]);
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
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-100">
        <div className="flex flex-wrap gap-2">
          {VERSION_KEYS.map((v) => (
            <button
              key={v}
              onClick={() => toggleVersion(v)}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors border ${
                selectedVersions.includes(v)
                  ? "text-white border-transparent"
                  : "bg-white text-gray-400 border-gray-200 hover:border-gray-300"
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
        {/* Version column headers */}
        <div
          className="sticky top-0 z-10 bg-white border-b border-gray-100 grid"
          style={{ gridTemplateColumns: `3rem repeat(${selectedVersions.length}, 1fr)` }}
        >
          <div className="px-2 py-3 text-xs font-bold text-gray-400 text-center">#</div>
          {selectedVersions.map((v) => (
            <div
              key={v}
              className="px-4 py-3 text-sm font-bold"
              style={{ color: BIBLE_VERSIONS[v].color }}
            >
              {BIBLE_VERSIONS[v].label}
            </div>
          ))}
        </div>

        {/* Verses */}
        {maxVerse > 0 &&
          Array.from({ length: maxVerse }, (_, i) => i + 1).map((verseNum) => (
            <div
              key={verseNum}
              onClick={() => setHighlightVerse(highlightVerse === verseNum ? null : verseNum)}
              className={`grid border-b border-gray-50 cursor-pointer transition-colors ${
                highlightVerse === verseNum ? "bg-amber-50" : "hover:bg-gray-50"
              }`}
              style={{ gridTemplateColumns: `3rem repeat(${selectedVersions.length}, 1fr)` }}
            >
              <div className="px-2 py-3 text-xs font-bold text-gray-400 text-center pt-3.5">
                {verseNum}
              </div>
              {selectedVersions.map((v) => {
                const data = chapterData[`${v}-${book}-${chapter}`];
                const isLoading = loading[v];
                const hasError = errors[v];
                const verseData = data?.verses.find((vv) => vv.verse === verseNum);

                return (
                  <div key={v} className="px-4 py-3 text-[13px] text-gray-700 leading-relaxed border-l border-gray-100">
                    {isLoading && (
                      <div className="h-3 bg-gray-100 rounded animate-pulse w-3/4" />
                    )}
                    {hasError && (
                      <span className="text-red-400 text-xs">Error</span>
                    )}
                    {verseData && verseData.text}
                    {!isLoading && !hasError && !verseData && (
                      <span className="text-gray-300">—</span>
                    )}
                  </div>
                );
              })}
            </div>
          ))}

        {/* Loading state for all columns */}
        {maxVerse === 0 && (
          <div className="p-8 text-center text-sm text-gray-400">
            {Object.values(loading).some(Boolean) ? "Loading translations..." : "Select versions above to compare"}
          </div>
        )}
      </div>
    </div>
  );
}
