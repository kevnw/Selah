"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

function generateRoomId(): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  return Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#06b6d4"];
function randomColor() {
  return COLORS[Math.floor(Math.random() * COLORS.length)];
}

export default function Home() {
  const router = useRouter();
  const [joinCode, setJoinCode] = useState("");
  const [name, setName] = useState("");

  function saveSession(overrideName?: string) {
    const userName = (overrideName || name || "Guest").trim();
    const session = {
      userId: crypto.randomUUID(),
      userName,
      userColor: randomColor(),
    };
    localStorage.setItem("wordtogether_session", JSON.stringify(session));
  }

  function createRoom() {
    saveSession();
    const id = generateRoomId();
    router.push(`/room/${id}`);
  }

  function joinRoom() {
    const code = joinCode.trim().toLowerCase().replace(/[^a-z0-9]/g, "");
    if (code.length < 4) return;
    saveSession();
    router.push(`/room/${code}`);
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex flex-col items-center mb-10">
          <div className="w-14 h-14 rounded-2xl bg-gray-900 flex items-center justify-center mb-4 shadow-lg">
            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Selah</h1>
          <p className="text-gray-500 mt-2 text-center text-sm">
            Read the Bible and reflect together, in real time
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-5">
          {/* Name */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
              Your name
            </label>
            <input
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g. John Smith"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && createRoom()}
            />
          </div>

          {/* Create room */}
          <button
            onClick={createRoom}
            className="w-full py-3 bg-gray-900 text-white font-semibold rounded-xl hover:bg-gray-700 transition-colors text-sm"
          >
            Create a new room
          </button>

          <div className="relative flex items-center">
            <div className="flex-1 border-t border-gray-100" />
            <span className="mx-3 text-xs text-gray-400">or join existing</span>
            <div className="flex-1 border-t border-gray-100" />
          </div>

          {/* Join room */}
          <div className="flex gap-2">
            <input
              className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono"
              placeholder="Room code (e.g. a4b2c8d1)"
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && joinRoom()}
            />
            <button
              onClick={joinRoom}
              disabled={joinCode.trim().length < 4}
              className="px-4 py-2.5 bg-blue-600 text-white font-semibold rounded-xl disabled:opacity-40 hover:bg-blue-700 transition-colors text-sm"
            >
              Join
            </button>
          </div>
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          Supports NIV · KJV · ESV · The Message · TB (Indonesian)
        </p>
      </div>
    </div>
  );
}
