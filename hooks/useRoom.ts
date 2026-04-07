"use client";

import { useEffect, useRef, useState } from "react";
import { Message, Presence } from "@/lib/types";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { UserSession } from "@/lib/session";

interface UseRoomReturn {
  messages: Message[];
  onlineUsers: Presence[];
  sendMessage: (content: string, verseRef?: string) => void;
  loading: boolean;
}

export function useRoom(roomId: string, session: UserSession | null): UseRoomReturn {
  const [messages, setMessages] = useState<Message[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<Presence[]>([]);
  const [loading, setLoading] = useState(true);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  useEffect(() => {
    if (!session) return;

    if (!isSupabaseConfigured()) {
      setLoading(false);
      return;
    }

    // Load existing messages from DB
    supabase
      .from("messages")
      .select("*")
      .eq("room_id", roomId)
      .order("created_at", { ascending: true })
      .then(({ data }) => {
        if (data) setMessages(data as Message[]);
        setLoading(false);
      });

    const channel = supabase
      .channel(`room:${roomId}`)
      // Broadcast: ultra-low latency (~50ms), direct websocket delivery
      .on("broadcast", { event: "message" }, ({ payload }) => {
        const msg = payload as Message;
        setMessages((prev) => {
          // Skip if already added optimistically by this user
          if (prev.some((m) => m.id === msg.id)) return prev;
          return [...prev, msg];
        });
      })
      .on("presence", { event: "sync" }, () => {
        const state = channel.presenceState<Presence>();
        setOnlineUsers(Object.values(state).flat());
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          await channel.track({
            user_id: session.userId,
            user_name: session.userName,
            user_color: session.userColor,
            online_at: new Date().toISOString(),
          });
        }
      });

    channelRef.current = channel;

    return () => {
      channel.unsubscribe();
    };
  }, [roomId, session]);

  function sendMessage(content: string, verseRef?: string) {
    if (!session) return;

    const msg: Message = {
      id: crypto.randomUUID(),
      room_id: roomId,
      user_id: session.userId,
      user_name: session.userName,
      user_color: session.userColor,
      content,
      verse_ref: verseRef,
      created_at: new Date().toISOString(),
    };

    if (!isSupabaseConfigured()) {
      setMessages((prev) => [...prev, msg]);
      return;
    }

    // 1. Show instantly for the sender (optimistic)
    setMessages((prev) => [...prev, msg]);

    // 2. Broadcast to all other users in the room (fast path, ~50ms)
    channelRef.current?.send({
      type: "broadcast",
      event: "message",
      payload: msg,
    });

    // 3. Persist to DB in background (slow path, for history)
    supabase.from("messages").insert(msg).then(({ error }) => {
      if (error) console.error("Failed to persist message:", error);
    });
  }

  return { messages, onlineUsers, sendMessage, loading };
}
