"use client";

import { useState } from "react";
import {
  BIBLE_BOOKS, BIBLE_BOOKS_ID, CHAPTER_COUNTS,
  BOOK_NAME_EN_TO_ID, BOOK_NAME_ID_TO_EN,
} from "@/lib/types";

interface Props {
  book: string;
  chapter: number;
  onChange: (book: string, chapter: number) => void;
}

type Lang = "EN" | "ID";

function displayName(englishBook: string, lang: Lang) {
  return lang === "ID" ? (BOOK_NAME_EN_TO_ID[englishBook] || englishBook) : englishBook;
}

export function BookChapterPicker({ book, chapter, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const [selectedBook, setSelectedBook] = useState(book);
  const [bookSearch, setBookSearch] = useState("");
  const [lang, setLang] = useState<Lang>("EN");

  const bookList = lang === "ID" ? BIBLE_BOOKS_ID : BIBLE_BOOKS;
  const filteredBooks = bookList.filter((b) => b.toLowerCase().includes(bookSearch.toLowerCase()));
  const selectedBookEn = lang === "ID" ? (BOOK_NAME_ID_TO_EN[selectedBook] || selectedBook) : selectedBook;
  const chapterCount = CHAPTER_COUNTS[selectedBookEn] || 1;

  function handleSelectChapter(ch: number) {
    const bookEn = lang === "ID" ? (BOOK_NAME_ID_TO_EN[selectedBook] || selectedBook) : selectedBook;
    onChange(bookEn, ch);
    setOpen(false);
    setBookSearch("");
  }

  if (!open) {
    return (
      <button
        onClick={() => {
          setSelectedBook(lang === "ID" ? (BOOK_NAME_EN_TO_ID[book] || book) : book);
          setOpen(true);
        }}
        className="flex items-center gap-1 text-base font-semibold text-gray-900 dark:text-gray-100 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
      >
        {displayName(book, lang)} {chapter}
        <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4" onClick={() => setOpen(false)}>
      <div
        className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-[480px] max-h-[80vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Language toggle */}
        <div className="flex items-center justify-between px-4 pt-3 pb-0 flex-shrink-0">
          <span className="text-xs text-gray-400 dark:text-gray-500 font-medium">Book language</span>
          <div className="flex rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 text-xs font-semibold">
            {(["EN", "ID"] as Lang[]).map((l) => (
              <button
                key={l}
                onClick={() => {
                  if (l === "ID" && lang === "EN") setSelectedBook(BOOK_NAME_EN_TO_ID[selectedBook] || selectedBook);
                  else if (l === "EN" && lang === "ID") setSelectedBook(BOOK_NAME_ID_TO_EN[selectedBook] || selectedBook);
                  setLang(l);
                  setBookSearch("");
                }}
                className={`px-3 py-1.5 transition-colors ${
                  lang === l
                    ? "bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900"
                    : "text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"
                }`}
              >
                {l === "EN" ? "English" : "Indonesia"}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-1 min-h-0 mt-3">
          <div className="w-1/2 border-r border-gray-100 dark:border-gray-800 flex flex-col min-h-0">
            <div className="p-3 border-b border-gray-100 dark:border-gray-800 flex-shrink-0">
              <input
                autoFocus
                className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-600"
                placeholder={lang === "ID" ? "Cari kitab..." : "Search book..."}
                value={bookSearch}
                onChange={(e) => setBookSearch(e.target.value)}
              />
            </div>
            <div className="overflow-y-auto flex-1">
              {filteredBooks.map((b) => (
                <button
                  key={b}
                  onClick={() => setSelectedBook(b)}
                  className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${
                    b === selectedBook
                      ? "bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 font-semibold"
                      : "text-gray-700 dark:text-gray-300"
                  }`}
                >
                  {b}
                </button>
              ))}
            </div>
          </div>

          <div className="w-1/2 flex flex-col min-h-0">
            <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex-shrink-0">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-sm">{selectedBook}</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">{chapterCount} {lang === "ID" ? "pasal" : "chapters"}</p>
            </div>
            <div className="overflow-y-auto flex-1 p-3">
              <div className="grid grid-cols-4 gap-1.5">
                {Array.from({ length: chapterCount }, (_, i) => i + 1).map((ch) => (
                  <button
                    key={ch}
                    onClick={() => handleSelectChapter(ch)}
                    className={`aspect-square rounded-lg text-sm font-medium transition-colors flex items-center justify-center ${
                      ch === chapter && selectedBookEn === book
                        ? "bg-blue-600 text-white"
                        : "hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"
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
    </div>
  );
}
