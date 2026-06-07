"use client";

import { useParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Button, cn } from "@repo/ui";
import { useChat } from "../../../../hooks/useChat";
import { apiFetch } from "../../../../lib/api";
import { ErrorState, PageHeader } from "../../../../components/shared/page-state";

export default function ChatPage() {
  const params = useParams();
  const id = params.id as string;
  const {
    messages,
    streaming,
    streamContent,
    loading,
    error,
    sendMessage,
    loadMessages,
  } = useChat(id);
  const [input, setInput] = useState("");
  const [aiConfigured, setAiConfigured] = useState<boolean | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (id) void loadMessages(id);
  }, [id, loadMessages]);

  useEffect(() => {
    void apiFetch<{ configured: boolean }>("/ai/status", { auth: false }).then(
      (r) => {
        if (r.ok) setAiConfigured(r.data.configured);
      },
    );
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, streamContent]);

  function handleSend(e: React.FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text) return;
    setInput("");
    void sendMessage(text);
  }

  const isEmpty = !loading && messages.length === 0 && !streaming;

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col">
      <PageHeader title="Chat" />

      {aiConfigured === false && (
        <div className="mb-4 rounded-lg border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-300">
          <strong>Demo mode:</strong> no <code>OPENAI_API_KEY</code> is
          configured, so the assistant returns mock responses. Add a key to the
          API environment to enable live model streaming.
        </div>
      )}

      <div
        ref={scrollRef}
        className="flex-1 space-y-3 overflow-y-auto py-2"
      >
        {isEmpty ? (
          <div className="flex h-full items-center justify-center text-center text-sm text-muted-foreground">
            Send a message to start the conversation.
          </div>
        ) : (
          messages.map((m) => (
            <div
              key={m.id}
              className={cn(
                "max-w-[80%] whitespace-pre-wrap rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
                m.role === "USER"
                  ? "ml-auto bg-primary text-primary-foreground"
                  : "mr-auto border border-border bg-card",
              )}
            >
              {m.content}
            </div>
          ))
        )}
        {streaming && streamContent && (
          <div className="mr-auto max-w-[80%] whitespace-pre-wrap rounded-2xl border border-border bg-card px-4 py-2.5 text-sm leading-relaxed">
            {streamContent}
            <span className="ml-0.5 inline-block h-4 w-1.5 animate-pulse bg-muted-foreground align-middle" />
          </div>
        )}
      </div>

      {error && (
        <div className="mb-3">
          <ErrorState message={error} />
        </div>
      )}

      <form
        className="flex gap-2 border-t border-border pt-4"
        onSubmit={handleSend}
      >
        <input
          className="flex-1 rounded-lg border border-input bg-background px-4 py-2.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Message the assistant…"
          disabled={streaming}
        />
        <Button type="submit" disabled={streaming || !input.trim()}>
          {streaming ? "Sending…" : "Send"}
        </Button>
      </form>
    </div>
  );
}
