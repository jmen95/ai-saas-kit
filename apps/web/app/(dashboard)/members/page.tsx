"use client";

import { useCallback, useEffect, useState } from "react";
import { Badge, Button, Card, Skeleton } from "@repo/ui";
import { apiFetch } from "../../../lib/api";
import { ErrorState, PageHeader } from "../../../components/shared/page-state";
import { InviteDialog } from "../../../components/members/invite-dialog";

type Member = {
  id: string;
  role: string;
  user: { id: string; email: string; name: string | null };
};

type Invitation = {
  id: string;
  email: string;
  role: string;
  expired: boolean;
};

const ROLES = ["OWNER", "ADMIN", "MEMBER"];

export default function MembersPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    const [membersRes, invitesRes] = await Promise.all([
      apiFetch<Member[]>("/organizations/current/members"),
      apiFetch<Invitation[]>("/organizations/current/invitations"),
    ]);
    if (membersRes.ok) setMembers(membersRes.data);
    else setError(membersRes.error.message);
    if (invitesRes.ok) setInvitations(invitesRes.data);
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function changeRole(memberId: string, role: string) {
    setActionError(null);
    const res = await apiFetch(`/organizations/current/members/${memberId}`, {
      method: "PATCH",
      body: JSON.stringify({ role }),
    });
    if (res.ok) void load();
    else setActionError(res.error.message);
  }

  async function removeMember(memberId: string) {
    setActionError(null);
    const res = await apiFetch(`/organizations/current/members/${memberId}`, {
      method: "DELETE",
    });
    if (res.ok) void load();
    else setActionError(res.error.message);
  }

  async function revokeInvite(id: string) {
    setActionError(null);
    const res = await apiFetch(`/organizations/current/invitations/${id}`, {
      method: "DELETE",
    });
    if (res.ok) void load();
    else setActionError(res.error.message);
  }

  return (
    <>
      <PageHeader
        title="Members"
        description="Invite teammates and manage their roles."
        action={<InviteDialog onInvited={load} />}
      />

      {actionError && (
        <div className="mb-4">
          <ErrorState message={actionError} />
        </div>
      )}

      {loading ? (
        <Skeleton className="h-40 w-full rounded-xl" />
      ) : error ? (
        <ErrorState message={error} onRetry={load} />
      ) : (
        <div className="flex flex-col gap-6">
          <Card className="divide-y divide-border">
            {members.map((m) => (
              <div
                key={m.id}
                className="flex items-center justify-between gap-4 px-5 py-4"
              >
                <div className="min-w-0">
                  <p className="truncate font-medium">
                    {m.user.name ?? m.user.email}
                  </p>
                  <p className="truncate text-sm text-muted-foreground">
                    {m.user.email}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {m.role === "OWNER" ? (
                    <Badge>OWNER</Badge>
                  ) : (
                    <>
                      <select
                        value={m.role}
                        onChange={(e) => changeRole(m.id, e.target.value)}
                        className="rounded-md border border-input bg-background px-2 py-1 text-sm"
                      >
                        {ROLES.filter((r) => r !== "OWNER").map((r) => (
                          <option key={r} value={r}>
                            {r}
                          </option>
                        ))}
                      </select>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeMember(m.id)}
                      >
                        Remove
                      </Button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </Card>

          {invitations.length > 0 && (
            <section>
              <h2 className="mb-2 text-sm font-semibold text-muted-foreground">
                Pending invitations
              </h2>
              <Card className="divide-y divide-border">
                {invitations.map((inv) => (
                  <div
                    key={inv.id}
                    className="flex items-center justify-between gap-4 px-5 py-4"
                  >
                    <div className="min-w-0">
                      <p className="truncate font-medium">{inv.email}</p>
                      <p className="text-sm text-muted-foreground">
                        {inv.role}
                        {inv.expired ? " · expired" : " · pending"}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => revokeInvite(inv.id)}
                    >
                      Revoke
                    </Button>
                  </div>
                ))}
              </Card>
            </section>
          )}
        </div>
      )}
    </>
  );
}
