"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "../../../lib/api";
import styles from "../../dashboard.module.css";

type Usage = {
  plan: string;
  messagesUsedThisMonth: number;
  messagesLimit: number;
};

export default function OverviewPage() {
  const [usage, setUsage] = useState<Usage | null>(null);
  const [org, setOrg] = useState<{ name: string; plan: string } | null>(null);

  useEffect(() => {
    void apiFetch<Usage>("/billing/usage").then((r) => {
      if (r.ok) setUsage(r.data);
    });
    void apiFetch<{ name: string; plan: string }>("/organizations/current").then(
      (r) => {
        if (r.ok) setOrg(r.data);
      },
    );
  }, []);

  const limit =
    usage?.messagesLimit === Infinity ? "∞" : usage?.messagesLimit;

  return (
    <>
      <header className={styles.header}>
        <h1 className={styles.pageTitle}>
          {org?.name ?? "Dashboard"}
        </h1>
      </header>
      <div className={styles.grid}>
        <div className={styles.card}>
          <p className={styles.statValue}>{org?.plan ?? "—"}</p>
          <p className={styles.statLabel}>Current plan</p>
        </div>
        <div className={styles.card}>
          <p className={styles.statValue}>
            {usage?.messagesUsedThisMonth ?? 0}
            <span style={{ fontSize: "1rem", color: "#64748b" }}>
              {" "}
              / {limit}
            </span>
          </p>
          <p className={styles.statLabel}>Messages this month</p>
        </div>
      </div>
    </>
  );
}
