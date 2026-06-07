"use client";

import { useCallback, useEffect, useState } from "react";
import { Badge, Card } from "@repo/ui";
import { apiFetch } from "../../../lib/api";
import {
  CardSkeleton,
  ErrorState,
  PageHeader,
} from "../../../components/shared/page-state";

type Usage = {
  plan: string;
  messagesUsedThisMonth: number;
  messagesLimit: number;
  conversationsTotal?: number;
  conversationsLimit?: number;
};

type Org = { name: string; plan: string };

export default function OverviewPage() {
  const [usage, setUsage] = useState<Usage | null>(null);
  const [org, setOrg] = useState<Org | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    const [usageRes, orgRes] = await Promise.all([
      apiFetch<Usage>("/billing/usage"),
      apiFetch<Org>("/organizations/current"),
    ]);
    if (!usageRes.ok && !orgRes.ok) {
      setError("Could not load your workspace. Please try again.");
      setLoading(false);
      return;
    }
    if (usageRes.ok) setUsage(usageRes.data);
    if (orgRes.ok) setOrg(orgRes.data);
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const limit =
    usage?.messagesLimit === Infinity ? "∞" : (usage?.messagesLimit ?? "—");
  const used = usage?.messagesUsedThisMonth ?? 0;
  const pct =
    typeof usage?.messagesLimit === "number" &&
    usage.messagesLimit > 0 &&
    usage.messagesLimit !== Infinity
      ? Math.min(100, Math.round((used / usage.messagesLimit) * 100))
      : 0;

  return (
    <>
      <PageHeader
        title={org?.name ?? "Overview"}
        description="Your workspace usage at a glance."
      />

      {loading ? (
        <CardSkeleton count={3} />
      ) : error ? (
        <ErrorState message={error} onRetry={load} />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">Current plan</p>
              <Badge variant="secondary">{org?.plan ?? usage?.plan}</Badge>
            </div>
            <p className="mt-2 text-3xl font-bold">
              {org?.plan ?? usage?.plan ?? "—"}
            </p>
          </Card>

          <Card className="p-6">
            <p className="text-sm text-muted-foreground">Messages this month</p>
            <p className="mt-2 text-3xl font-bold">
              {used}
              <span className="text-base font-normal text-muted-foreground">
                {" "}
                / {limit}
              </span>
            </p>
            <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary transition-all"
                style={{ width: `${pct}%` }}
              />
            </div>
          </Card>

          <Card className="p-6">
            <p className="text-sm text-muted-foreground">Plan limit</p>
            <p className="mt-2 text-3xl font-bold">{limit}</p>
            <p className="mt-3 text-sm text-muted-foreground">
              Messages allowed per month on your plan.
            </p>
          </Card>
        </div>
      )}
    </>
  );
}
