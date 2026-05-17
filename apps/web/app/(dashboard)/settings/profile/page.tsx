"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "../../../../lib/api";
import styles from "../../../dashboard.module.css";

export default function ProfileSettingsPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    void apiFetch<{ name: string | null; email: string }>("/users/me").then(
      (r) => {
        if (r.ok) {
          setName(r.data.name ?? "");
          setEmail(r.data.email);
        }
      },
    );
  }, []);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    const result = await apiFetch("/users/me", {
      method: "PATCH",
      body: JSON.stringify({ name }),
    });
    if (result.ok) setSaved(true);
  }

  return (
    <>
      <header className={styles.header}>
        <h1 className={styles.pageTitle}>Profile</h1>
      </header>
      <form className={styles.card} onSubmit={save}>
        <p style={{ marginBottom: "1rem", color: "#94a3b8" }}>{email}</p>
        <label style={{ display: "block", marginBottom: "1rem" }}>
          <span style={{ fontSize: "0.8125rem", color: "#94a3b8" }}>Name</span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={{
              display: "block",
              width: "100%",
              marginTop: "0.35rem",
              padding: "0.6rem",
              borderRadius: "8px",
              border: "1px solid rgba(255,255,255,0.12)",
              background: "rgba(15,23,42,0.6)",
              color: "#f1f5f9",
            }}
          />
        </label>
        <button
          type="submit"
          style={{
            padding: "0.6rem 1rem",
            background: "#2563eb",
            color: "#fff",
            border: "none",
            borderRadius: "8px",
          }}
        >
          Save
        </button>
        {saved && (
          <p style={{ marginTop: "0.75rem", color: "#4ade80" }}>Saved.</p>
        )}
      </form>
    </>
  );
}
