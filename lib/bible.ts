import { BibleChapter } from "./types";

const API_BIBLE_KEY = process.env.NEXT_PUBLIC_API_BIBLE_KEY || "";
const API_BASE = "https://api.scripture.api.bible/v1";

// Book ID mapping for api.bible
const BOOK_IDS: Record<string, string> = {
  Genesis: "GEN", Exodus: "EXO", Leviticus: "LEV", Numbers: "NUM", Deuteronomy: "DEU",
  Joshua: "JOS", Judges: "JDG", Ruth: "RUT", "1 Samuel": "1SA", "2 Samuel": "2SA",
  "1 Kings": "1KI", "2 Kings": "2KI", "1 Chronicles": "1CH", "2 Chronicles": "2CH", Ezra: "EZR",
  Nehemiah: "NEH", Esther: "EST", Job: "JOB", Psalms: "PSA", Proverbs: "PRO",
  Ecclesiastes: "ECC", "Song of Solomon": "SNG", Isaiah: "ISA", Jeremiah: "JER", Lamentations: "LAM",
  Ezekiel: "EZK", Daniel: "DAN", Hosea: "HOS", Joel: "JOL", Amos: "AMO",
  Obadiah: "OBA", Jonah: "JON", Micah: "MIC", Nahum: "NAM", Habakkuk: "HAB",
  Zephaniah: "ZEP", Haggai: "HAG", Zechariah: "ZEC", Malachi: "MAL",
  Matthew: "MAT", Mark: "MRK", Luke: "LUK", John: "JHN", Acts: "ACT",
  Romans: "ROM", "1 Corinthians": "1CO", "2 Corinthians": "2CO", Galatians: "GAL", Ephesians: "EPH",
  Philippians: "PHP", Colossians: "COL", "1 Thessalonians": "1TH", "2 Thessalonians": "2TH",
  "1 Timothy": "1TI", "2 Timothy": "2TI", Titus: "TIT", Philemon: "PHM", Hebrews: "HEB",
  James: "JAS", "1 Peter": "1PE", "2 Peter": "2PE", "1 John": "1JN", "2 John": "2JN",
  "3 John": "3JN", Jude: "JUD", Revelation: "REV",
};

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]+>/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export async function fetchChapter(
  book: string,
  chapter: number,
  versionId: string
): Promise<BibleChapter> {
  const bookId = BOOK_IDS[book];
  if (!bookId) throw new Error(`Unknown book: ${book}`);

  const chapterId = `${bookId}.${chapter}`;

  if (!API_BIBLE_KEY) {
    return getFallbackChapter(book, chapter);
  }

  const url = `${API_BASE}/bibles/${versionId}/chapters/${chapterId}?content-type=text&include-notes=false&include-titles=false&include-chapter-numbers=false&include-verse-numbers=true&include-verse-spans=false`;

  const res = await fetch(url, {
    headers: { "api-key": API_BIBLE_KEY },
    next: { revalidate: 86400 }, // cache for 24h
  });

  if (!res.ok) {
    throw new Error(`Bible API error: ${res.status}`);
  }

  const data = await res.json();
  const content = data.data?.content || "";

  // Parse verse content - api.bible returns tagged content
  const verses = parseApiContent(content);

  return {
    book,
    chapter,
    verses,
    version: versionId,
  };
}

function parseApiContent(content: string) {
  const verses: { verse: number; text: string }[] = [];

  // The api returns content with verse numbers embedded
  // Pattern: [verse_number]text
  const lines = content.split("\n").filter((l) => l.trim());

  lines.forEach((line) => {
    const match = line.match(/^\[(\d+)\]\s*(.+)/);
    if (match) {
      verses.push({
        verse: parseInt(match[1]),
        text: stripHtml(match[2]).trim(),
      });
    }
  });

  // If parsing fails, try alternate approach
  if (verses.length === 0) {
    const plain = stripHtml(content);
    const parts = plain.split(/(?=\[\d+\])/);
    parts.forEach((part) => {
      const m = part.match(/\[(\d+)\]\s*([\s\S]+)/);
      if (m) {
        verses.push({
          verse: parseInt(m[1]),
          text: m[2].trim(),
        });
      }
    });
  }

  return verses;
}

// Fallback: use bible-api.com for KJV/ASV/WEB when no API key
async function getFallbackChapter(
  book: string,
  chapter: number
): Promise<BibleChapter> {
  // bible-api.com only has KJV, ASV, WEB, YLT, DARBY, WEB, OEBCUS, CLEMENTINE, ALMEIDA, RCCBE
  const fallbackVersion = "kjv";
  const bookEncoded = encodeURIComponent(book.toLowerCase().replace(/ /g, "+"));
  const url = `https://bible-api.com/${bookEncoded}+${chapter}?translation=${fallbackVersion}`;

  try {
    const res = await fetch(url, { next: { revalidate: 86400 } });
    if (!res.ok) throw new Error("Fallback API failed");
    const data = await res.json();

    const verses = (data.verses || []).map((v: { verse: number; text: string }) => ({
      verse: v.verse,
      text: v.text.trim(),
    }));

    return { book, chapter, verses, version: fallbackVersion };
  } catch {
    return getDemoChapter(book, chapter);
  }
}

function getDemoChapter(book: string, chapter: number): BibleChapter {
  if (book === "Psalms" && chapter === 23) {
    return {
      book,
      chapter,
      verses: [
        { verse: 1, text: "The Lord is my shepherd; I shall not want." },
        { verse: 2, text: "He makes me lie down in green pastures. He leads me beside still waters." },
        { verse: 3, text: "He restores my soul. He leads me in paths of righteousness for his name's sake." },
        { verse: 4, text: "Even though I walk through the valley of the shadow of death, I will fear no evil, for you are with me; your rod and your staff, they comfort me." },
        { verse: 5, text: "You prepare a table before me in the presence of my enemies; you anoint my head with oil; my cup overflows." },
        { verse: 6, text: "Surely goodness and mercy shall follow me all the days of my life, and I shall dwell in the house of the Lord forever." },
      ],
      version: "demo",
    };
  }
  return {
    book,
    chapter,
    verses: [
      { verse: 1, text: "Configure your API Bible key in .env.local to load Bible text." },
      { verse: 2, text: "Get a free key at https://scripture.api.bible" },
      { verse: 3, text: "Set NEXT_PUBLIC_API_BIBLE_KEY=your_key in .env.local" },
    ],
    version: "demo",
  };
}
