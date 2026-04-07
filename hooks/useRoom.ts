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
      // Demo mode: use local state only
      setLoading(false);
      return;
    }

    // Load existing messages
    supabase
      .from("messages")
      .select("*")
      .eq("room_id", roomId)
      .order("created_at", { ascending: true })
      .then(({ data }) => {
        if (data) setMessages(data as Message[]);
        setLoading(false);
      });

    // Subscribe to new messages
    const channel = supabase
      .channel(`room:${roomId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages", filter: `room_id=eq.${roomId}` },
        (payload) => {
          setMessages((prev) => [...prev, payload.new as Message]);
        }
      )
      .on("presence", { event: "sync" }, () => {
        const state = channel.presenceState<Presence>();
        const users = Object.values(state).flat();
        setOnlineUsers(users);
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
      // Demo mode: local only
      setMessages((prev) => [...prev, msg]);
      return;
    }

    supabase.from("messages").insert(msg).then(({ error }) => {
      if (error) console.error("Failed to send message:", error);
    });
  }

  return { messages, onlineUsers, sendMessage, loading };
}
