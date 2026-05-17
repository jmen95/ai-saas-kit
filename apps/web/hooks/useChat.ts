"use client";

import { useCallback, useState } from "react";
import { getStoredTokens } from "../lib/api";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

export type ChatMessage = {
  id: string;
  role: "USER" | "ASSISTANT";
  content: string;
};

export function useChat(conversationId: string | null) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [streaming, setStreaming] = useState(false);
  const [streamContent, setStreamContent] = useState("");

  const loadMessages = useCallback(async (id: string) => {
    const tokens = getStoredTokens();
    const res = await fetch(`${API_URL}/ai/conversations/${id}`, {
      headers: tokens?.accessToken
        ? { Authorization: `Bearer ${tokens.accessToken}` }
        : {},
    });
    const json = await res.json();
    if (json.data?.messages) {
      setMessages(
        json.data.messages.map((m: ChatMessage) => ({
          id: m.id,
          role: m.role,
          content: m.content,
        })),
      );
    }
  }, []);

  const sendMessage = useCallback(
    async (text: string) => {
      if (!conversationId || !text.trim()) return;

      const tokens = getStoredTokens();
      if (!tokens?.accessToken) return;

      setMessages((prev) => [
        ...prev,
        { id: `user-${Date.now()}`, role: "USER", content: text },
      ]);
      setStreaming(true);
      setStreamContent("");

      const url = new URL(
        `${API_URL}/ai/conversations/${conversationId}/stream`,
      );
      url.searchParams.set("message", text);

      const res = await fetch(url.toString(), {
        headers: { Authorization: `Bearer ${tokens.accessToken}` },
      });

      if (!res.body) {
        setStreaming(false);
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let accumulated = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const parts = buffer.split("\n\n");
        buffer = parts.pop() ?? "";

        for (const part of parts) {
          for (const line of part.split("\n")) {
            if (!line.startsWith("data:")) continue;
            const raw = line.replace(/^data:\s*/, "").trim();
            if (!raw) continue;
            try {
              const parsed = JSON.parse(raw) as {
                delta?: string;
                done?: boolean;
              };
              if (parsed.delta) {
                accumulated += parsed.delta;
                setStreamContent(accumulated);
              }
              if (parsed.done) {
                setMessages((prev) => [
                  ...prev,
                  {
                    id: `assistant-${Date.now()}`,
                    role: "ASSISTANT",
                    content: accumulated,
                  },
                ]);
                setStreamContent("");
                setStreaming(false);
              }
            } catch {
              /* skip */
            }
          }
        }
      }

      if (accumulated) {
        setMessages((prev) => {
          const last = prev[prev.length - 1];
          if (last?.role === "ASSISTANT" && last.content === accumulated) {
            return prev;
          }
          return [
            ...prev,
            {
              id: `assistant-${Date.now()}`,
              role: "ASSISTANT",
              content: accumulated,
            },
          ];
        });
      }
      setStreamContent("");
      setStreaming(false);
    },
    [conversationId],
  );

  return { messages, streaming, streamContent, sendMessage, loadMessages };
}
