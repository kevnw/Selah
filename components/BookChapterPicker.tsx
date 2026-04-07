"use client";

import { useState } from "react";
import { BIBLE_BOOKS, CHAPTER_COUNTS } from "@/lib/types";

interface Props {
  book: string;
  chapter: number;
  onChange: (book: string, chapter: number) => void;
}

export function BookChapterPicker({ book, chapter, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const [selectedBook, setSelectedBook] = useState(book);
  const [bookSearch, setBookSearch] = useState("");

  const filteredBooks = BIBLE_BOOKS.filter((b) =>
    b.toLowerCase().includes(bookSearch.toLowerCase())
  );

  const chapterCount = CHAPTER_COUNTS[selectedBook] || 1;

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1 text-base font-semibold text-gray-900 hover:text-blue-600 transition-colors"
      >
        {book} {chapter}
        <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30" onClick={() => setOpen(false)}>
      <div
        className="bg-white rounded-2xl shadow-2xl w-[480px] max-h-[80vh] flex overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Book list */}
        <div className="w-1/2 border-r flex flex-col">
          <div className="p-3 border-b">
            <input
              autoFocus
              className="w-full px-3 py-2 text-sm border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Search book..."
              value={bookSearch}
              onChange={(e) => setBookSearch(e.target.value)}
            />
          </div>
          <div className="overflow-y-auto flex-1">
            {filteredBooks.map((b) => (
              <button
                key={b}
                onClick={() => setSelectedBook(b)}
                className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors ${
                  b === selectedBook ? "bg-blue-50 text-blue-700 font-semibold" : "text-gray-700"
                }`}
              >
                {b}
              </button>
            ))}
          </div>
        </div>

        {/* Chapter grid */}
        <div className="w-1/2 flex flex-col">
          <div className="p-4 border-b">
            <h3 className="font-semibold text-gray-900">{selectedBook}</h3>
            <p className="text-xs text-gray-500">{chapterCount} chapters</p>
          </div>
          <div className="overflow-y-auto flex-1 p-3">
            <div className="grid grid-cols-4 gap-1.5">
              {Array.from({ length: chapterCount }, (_, i) => i + 1).map((ch) => (
                <button
                  key={ch}
                  onClick={() => {
                    onChange(selectedBook, ch);
                    setOpen(false);
                    setBookSearch("");
                  }}
                  className={`aspect-square rounded-lg text-sm font-medium transition-colors flex items-center justify-center ${
                    ch === chapter && selectedBook === book
                      ? "bg-blue-600 text-white"
                      : "hover:bg-gray-100 text-gray-700"
                  }`}
                >
                  {ch}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
