"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "../../../../lib/api";
import styles from "../../../dashboard.module.css";

type Plan = { id: string; name: string; priceMonthly: number | null };

export default function BillingPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [usage, setUsage] = useState<{
    plan: string;
    messagesUsedThisMonth: number;
    messagesLimit: number;
  } | null>(null);

  useEffect(() => {
    void apiFetch<Plan[]>("/billing/plans", { auth: false }).then((r) => {
      if (r.ok) setPlans(r.data);
    });
    void apiFetch("/billing/usage").then((r) => {
      if (r.ok) setUsage(r.data as typeof usage);
    });
  }, []);

  return (
    <>
      <header className={styles.header}>
        <h1 className={styles.pageTitle}>Billing</h1>
      </header>
      {usage && (
        <div className={styles.card} style={{ marginBottom: "1rem" }}>
          <p>
            Plan: <strong>{usage.plan}</strong>
          </p>
          <p style={{ color: "#94a3b8", marginTop: "0.5rem" }}>
            {usage.messagesUsedThisMonth} /{" "}
            {usage.messagesLimit === Infinity ? "∞" : usage.messagesLimit}{" "}
            messages used
          </p>
        </div>
      )}
      <div className={styles.grid}>
        {plans.map((plan) => (
          <div key={plan.id} className={styles.card}>
            <h3 style={{ fontWeight: 600 }}>{plan.name}</h3>
            <p style={{ color: "#94a3b8", marginTop: "0.5rem" }}>
              {plan.priceMonthly === null
                ? "Contact sales"
                : plan.priceMonthly === 0
                  ? "Free"
                  : `$${plan.priceMonthly}/mo`}
            </p>
          </div>
        ))}
      </div>
    </>
  );
}
