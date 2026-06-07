"use client";

import { useCallback, useEffect, useState } from "react";
import { Badge, Button, Card } from "@repo/ui";
import { apiFetch } from "../../../../lib/api";
import {
  CardSkeleton,
  ErrorState,
  PageHeader,
} from "../../../../components/shared/page-state";

type Plan = {
  id: string;
  name: string;
  priceMonthly: number | null;
  priceId: string | null;
};
type Usage = {
  plan: string;
  messagesUsedThisMonth: number;
  messagesLimit: number;
};
type Subscription = {
  plan: string;
  stripeSubscriptionId: string | null;
  stripeConfigured: boolean;
};

export default function BillingPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [usage, setUsage] = useState<Usage | null>(null);
  const [sub, setSub] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    const [plansRes, usageRes, subRes] = await Promise.all([
      apiFetch<Plan[]>("/billing/plans", { auth: false }),
      apiFetch<Usage>("/billing/usage"),
      apiFetch<Subscription>("/billing/subscription"),
    ]);
    if (plansRes.ok) setPlans(plansRes.data);
    if (usageRes.ok) setUsage(usageRes.data);
    if (subRes.ok) setSub(subRes.data);
    if (!plansRes.ok && !usageRes.ok) setError("Could not load billing data.");
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function upgrade(priceId: string | null) {
    if (!priceId) return;
    setBusy(priceId);
    setActionError(null);
    const res = await apiFetch<{ checkoutUrl: string }>("/billing/checkout", {
      method: "POST",
      body: JSON.stringify({ priceId }),
    });
    setBusy(null);
    if (res.ok && res.data.checkoutUrl) {
      window.location.href = res.data.checkoutUrl;
    } else if (!res.ok) {
      setActionError(res.error.message);
    }
  }

  async function manage() {
    setBusy("portal");
    setActionError(null);
    const res = await apiFetch<{ portalUrl: string | null }>(
      "/billing/portal",
      { method: "POST" },
    );
    setBusy(null);
    if (res.ok && res.data.portalUrl) {
      window.location.href = res.data.portalUrl;
    } else if (res.ok) {
      setActionError("No billing portal available for this account yet.");
    } else {
      setActionError(res.error.message);
    }
  }

  function priceLabel(plan: Plan) {
    if (plan.priceMonthly === null) return "Contact sales";
    if (plan.priceMonthly === 0) return "Free";
    return `$${plan.priceMonthly}/mo`;
  }

  const stripeConfigured = sub?.stripeConfigured ?? false;
  const currentPlan = sub?.plan ?? usage?.plan;

  return (
    <>
      <PageHeader
        title="Billing"
        description="Manage your plan and track usage."
        action={
          stripeConfigured && sub?.stripeSubscriptionId ? (
            <Button
              variant="outline"
              onClick={manage}
              disabled={busy === "portal"}
            >
              {busy === "portal" ? "Opening…" : "Manage billing"}
            </Button>
          ) : null
        }
      />

      {!loading && !stripeConfigured && (
        <div className="mb-4 rounded-lg border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-300">
          <strong>Demo mode:</strong> Stripe is not configured. Plans are shown
          for reference — add Stripe keys to enable real checkout.
        </div>
      )}

      {actionError && (
        <div className="mb-4">
          <ErrorState message={actionError} />
        </div>
      )}

      {loading ? (
        <CardSkeleton count={3} />
      ) : error ? (
        <ErrorState message={error} onRetry={load} />
      ) : (
        <div className="flex flex-col gap-6">
          {usage && (
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">Current plan</p>
                <Badge variant="secondary">{currentPlan}</Badge>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                {usage.messagesUsedThisMonth} /{" "}
                {usage.messagesLimit === Infinity ? "∞" : usage.messagesLimit}{" "}
                messages used this month
              </p>
            </Card>
          )}

          <div className="grid gap-4 sm:grid-cols-3">
            {plans.map((plan) => {
              const isCurrent = currentPlan === plan.id;
              const canUpgrade =
                stripeConfigured && !!plan.priceId && !isCurrent;
              return (
                <Card key={plan.id} className="flex flex-col p-6">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">{plan.name}</h3>
                    {isCurrent && <Badge>Current</Badge>}
                  </div>
                  <p className="mt-2 text-2xl font-bold">{priceLabel(plan)}</p>
                  {canUpgrade && (
                    <Button
                      className="mt-4"
                      onClick={() => upgrade(plan.priceId)}
                      disabled={busy === plan.priceId}
                    >
                      {busy === plan.priceId ? "Redirecting…" : "Upgrade"}
                    </Button>
                  )}
                </Card>
              );
            })}
          </div>
        </div>
      )}
    </>
  );
}
