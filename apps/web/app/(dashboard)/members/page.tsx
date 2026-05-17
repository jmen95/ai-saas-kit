"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "../../../lib/api";
import styles from "../../dashboard.module.css";

type Member = {
  id: string;
  role: string;
  user: { id: string; email: string; name: string | null };
};

export default function MembersPage() {
  const [members, setMembers] = useState<Member[]>([]);

  useEffect(() => {
    void apiFetch<Member[]>("/organizations/current/members").then((r) => {
      if (r.ok) setMembers(r.data);
    });
  }, []);

  return (
    <>
      <header className={styles.header}>
        <h1 className={styles.pageTitle}>Members</h1>
      </header>
      <div className={styles.card}>
        <ul style={{ listStyle: "none" }}>
          {members.map((m) => (
            <li
              key={m.id}
              style={{
                padding: "0.75rem 0",
                borderBottom: "1px solid rgba(255,255,255,0.06)",
              }}
            >
              <strong>{m.user.name ?? m.user.email}</strong>
              <span style={{ marginLeft: "0.5rem", color: "#64748b" }}>
                {m.role}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
