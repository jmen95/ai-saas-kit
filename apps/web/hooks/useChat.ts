"use client";

import { useCallback, useState } from "react";
import { API_URL, apiFetch, getStoredTokens } from "../lib/api";

export type ChatMessage = {
  id: string;
  role: "USER" | "ASSISTANT";
  content: string;
};

export function useChat(conversationId: string | null) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [streaming, setStreaming] = useState(false);
  const [streamContent, setStreamContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadMessages = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    const res = await apiFetch<{ messages?: ChatMessage[] }>(
      `/ai/conversations/${id}`,
    );
    setLoading(false);
    if (!res.ok) {
      setError(res.error.message);
      return;
    }
    setMessages(
      (res.data.messages ?? []).map((m) => ({
        id: m.id,
        role: m.role,
        content: m.content,
      })),
    );
  }, []);

  const sendMessage = useCallback(
    async (text: string) => {
      if (!conversationId || !text.trim()) return;
      const tokens = getStoredTokens();
      if (!tokens?.accessToken) {
        setError("Your session has expired. Please sign in again.");
        return;
      }

      setError(null);
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

      let res: Response;
      try {
        res = await fetch(url.toString(), {
          headers: { Authorization: `Bearer ${tokens.accessToken}` },
        });
      } catch {
        setStreaming(false);
        setError("Network error. Please check your connection and retry.");
        return;
      }

      if (!res.ok || !res.body) {
        setStreaming(false);
        let message = "The assistant could not respond.";
        try {
          const json = await res.json();
          message = json?.error?.message ?? message;
        } catch {
          /* keep default */
        }
        setError(message);
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
              /* skip malformed chunk */
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

  return {
    messages,
    streaming,
    streamContent,
    loading,
    error,
    sendMessage,
    loadMessages,
  };
}
