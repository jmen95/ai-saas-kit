"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@repo/ui";
import { apiFetch, getStoredTokens } from "../../../lib/api";

type InvitePreview = {
  email: string;
  role: string;
  organizationName: string;
  expired: boolean;
};

export default function InvitePage() {
  const params = useParams();
  const router = useRouter();
  const token = params.token as string;
  const [preview, setPreview] = useState<InvitePreview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [accepting, setAccepting] = useState(false);
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    setAuthed(!!getStoredTokens());
    void apiFetch<InvitePreview>(`/organizations/invitations/${token}`, {
      auth: false,
    }).then((r) => {
      if (r.ok) setPreview(r.data);
      else setError(r.error.message);
      setLoading(false);
    });
  }, [token]);

  async function accept() {
    setAccepting(true);
    setError(null);
    const res = await apiFetch("/organizations/invitations/accept", {
      method: "POST",
      body: JSON.stringify({ token }),
    });
    setAccepting(false);
    if (res.ok) {
      router.push("/overview");
      router.refresh();
    } else {
      setError(res.error.message);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-6">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-8 text-center">
        {loading ? (
          <p className="text-sm text-muted-foreground">Loading invitation…</p>
        ) : error && !preview ? (
          <>
            <h1 className="text-xl font-bold">Invitation unavailable</h1>
            <p className="mt-2 text-sm text-muted-foreground">{error}</p>
            <Link href="/" className="mt-6 inline-block">
              <Button variant="outline">Go home</Button>
            </Link>
          </>
        ) : preview ? (
          <>
            <h1 className="text-xl font-bold">
              Join {preview.organizationName}
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              You&apos;ve been invited as <strong>{preview.role}</strong>
              {preview.email ? ` (${preview.email})` : ""}.
            </p>

            {preview.expired ? (
              <p className="mt-6 text-sm text-destructive">
                This invitation has expired. Ask an admin to send a new one.
              </p>
            ) : authed ? (
              <div className="mt-6 flex flex-col gap-3">
                {error && <p className="text-sm text-destructive">{error}</p>}
                <Button onClick={accept} disabled={accepting}>
                  {accepting ? "Joining…" : "Accept invitation"}
                </Button>
              </div>
            ) : (
              <div className="mt-6 flex flex-col gap-3">
                <p className="text-sm text-muted-foreground">
                  Sign in or create an account to accept.
                </p>
                <Link href={`/login?next=/invite/${token}`}>
                  <Button className="w-full">Sign in</Button>
                </Link>
                <Link href={`/register?next=/invite/${token}`}>
                  <Button variant="outline" className="w-full">
                    Create account
                  </Button>
                </Link>
              </div>
            )}
          </>
        ) : null}
      </div>
    </div>
  );
}
