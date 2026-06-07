"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { Button, Card, Skeleton } from "@repo/ui";
import { apiFetch } from "../../../lib/api";
import {
  EmptyState,
  ErrorState,
  PageHeader,
} from "../../../components/shared/page-state";

type Conversation = {
  id: string;
  title: string | null;
  preview: string | null;
};

export default function ChatListPage() {
  const router = useRouter();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    const res = await apiFetch<Conversation[]>("/ai/conversations");
    if (res.ok) setConversations(res.data);
    else setError(res.error.message);
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function createConversation() {
    setCreating(true);
    const result = await apiFetch<{ id: string }>("/ai/conversations", {
      method: "POST",
      body: JSON.stringify({ title: "New chat" }),
    });
    setCreating(false);
    if (result.ok) router.push(`/chat/${result.data.id}`);
    else setError(result.error.message);
  }

  return (
    <>
      <PageHeader
        title="Conversations"
        description="Chat with the AI assistant in real time."
        action={
          <Button onClick={createConversation} disabled={creating}>
            {creating ? "Creating…" : "New conversation"}
          </Button>
        }
      />

      {loading ? (
        <div className="flex flex-col gap-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full rounded-xl" />
          ))}
        </div>
      ) : error ? (
        <ErrorState message={error} onRetry={load} />
      ) : conversations.length === 0 ? (
        <EmptyState
          title="No conversations yet"
          description="Start your first conversation to see the streaming AI assistant in action."
          action={
            <Button onClick={createConversation} disabled={creating}>
              {creating ? "Creating…" : "Start chatting"}
            </Button>
          }
        />
      ) : (
        <div className="flex flex-col gap-2">
          {conversations.map((c) => (
            <Link key={c.id} href={`/chat/${c.id}`}>
              <Card className="p-4 transition-colors hover:bg-accent">
                <p className="font-medium">{c.title ?? "Untitled"}</p>
                {c.preview && (
                  <p className="mt-1 truncate text-sm text-muted-foreground">
                    {c.preview}
                  </p>
                )}
              </Card>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
