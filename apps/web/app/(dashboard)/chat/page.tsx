"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { apiFetch } from "../../../lib/api";
import styles from "../../dashboard.module.css";
import chatStyles from "./chat.module.css";

type Conversation = {
  id: string;
  title: string | null;
  preview: string | null;
};

export default function ChatListPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    void apiFetch<Conversation[]>("/ai/conversations").then((r) => {
      if (r.ok) setConversations(r.data);
    });
  }, []);

  async function createConversation() {
    setCreating(true);
    const result = await apiFetch<{ id: string }>("/ai/conversations", {
      method: "POST",
      body: JSON.stringify({ title: "New chat" }),
    });
    setCreating(false);
    if (result.ok) {
      window.location.href = `/chat/${result.data.id}`;
    }
  }

  return (
    <>
      <header className={styles.header}>
        <h1 className={styles.pageTitle}>Conversations</h1>
      </header>
      <button
        type="button"
        className={chatStyles.newButton}
        onClick={createConversation}
        disabled={creating}
      >
        {creating ? "Creating…" : "+ New conversation"}
      </button>
      <ul className={chatStyles.list}>
        {conversations.map((c) => (
          <li key={c.id}>
            <Link href={`/chat/${c.id}`} className={chatStyles.listItem}>
              <span className={chatStyles.listTitle}>
                {c.title ?? "Untitled"}
              </span>
              {c.preview && (
                <span className={chatStyles.listPreview}>{c.preview}</span>
              )}
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}
