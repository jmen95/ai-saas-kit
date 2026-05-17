"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useChat } from "../../../../hooks/useChat";
import styles from "../../../dashboard.module.css";
import chatStyles from "../chat.module.css";

export default function ChatPage() {
  const params = useParams();
  const id = params.id as string;
  const { messages, streaming, streamContent, sendMessage, loadMessages } =
    useChat(id);
  const [input, setInput] = useState("");

  useEffect(() => {
    if (id) void loadMessages(id);
  }, [id, loadMessages]);

  function handleSend(e: React.FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text) return;
    setInput("");
    void sendMessage(text);
  }

  return (
    <>
      <header className={styles.header}>
        <h1 className={styles.pageTitle}>Chat</h1>
      </header>
      <div className={chatStyles.chatLayout}>
        <div className={chatStyles.messages}>
          {messages.map((m) => (
            <div
              key={m.id}
              className={`${chatStyles.bubble} ${
                m.role === "USER" ? chatStyles.user : chatStyles.assistant
              }`}
            >
              {m.content}
            </div>
          ))}
          {streaming && streamContent && (
            <div className={`${chatStyles.bubble} ${chatStyles.assistant}`}>
              {streamContent}
            </div>
          )}
        </div>
        <form className={chatStyles.inputRow} onSubmit={handleSend}>
          <input
            className={chatStyles.input}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Message…"
            disabled={streaming}
          />
          <button
            type="submit"
            className={chatStyles.send}
            disabled={streaming || !input.trim()}
          >
            Send
          </button>
        </form>
      </div>
    </>
  );
}
