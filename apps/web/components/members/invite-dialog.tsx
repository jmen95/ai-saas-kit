"use client";

import { useState } from "react";
import {
  Button,
  Input,
  Label,
  Modal,
  ModalContent,
  ModalDescription,
  ModalFooter,
  ModalHeader,
  ModalTitle,
  ModalTrigger,
} from "@repo/ui";
import { apiFetch } from "../../lib/api";

type InviteResult = {
  inviteUrl: string;
  emailSent: boolean;
};

export function InviteDialog({ onInvited }: { onInvited: () => void }) {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("MEMBER");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<InviteResult | null>(null);
  const [copied, setCopied] = useState(false);

  function reset() {
    setEmail("");
    setRole("MEMBER");
    setError(null);
    setResult(null);
    setCopied(false);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await apiFetch<InviteResult>(
      "/organizations/current/invitations",
      {
        method: "POST",
        body: JSON.stringify({ email, role }),
      },
    );
    setLoading(false);
    if (!res.ok) {
      setError(res.error.message);
      return;
    }
    setResult(res.data);
    onInvited();
  }

  async function copyLink() {
    if (!result) return;
    await navigator.clipboard.writeText(result.inviteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <Modal
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (!o) reset();
      }}
    >
      <ModalTrigger asChild>
        <Button>Invite member</Button>
      </ModalTrigger>
      <ModalContent>
        <ModalHeader>
          <ModalTitle>Invite a teammate</ModalTitle>
          <ModalDescription>
            They&apos;ll join your workspace through a secure invite link.
          </ModalDescription>
        </ModalHeader>

        {result ? (
          <div className="flex flex-col gap-3">
            <p className="text-sm text-muted-foreground">
              {result.emailSent
                ? "Invitation email sent. You can also share this link:"
                : "Share this invite link with your teammate:"}
            </p>
            <div className="flex gap-2">
              <Input value={result.inviteUrl} readOnly />
              <Button type="button" variant="outline" onClick={copyLink}>
                {copied ? "Copied" : "Copy"}
              </Button>
            </div>
            <ModalFooter>
              <Button onClick={() => setOpen(false)}>Done</Button>
            </ModalFooter>
          </div>
        ) : (
          <form className="flex flex-col gap-4" onSubmit={submit}>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="invite-email">Email</Label>
              <Input
                id="invite-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="teammate@company.com"
                required
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="invite-role">Role</Label>
              <select
                id="invite-role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="MEMBER">Member</option>
                <option value="ADMIN">Admin</option>
              </select>
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <ModalFooter>
              <Button type="submit" disabled={loading}>
                {loading ? "Sending…" : "Send invite"}
              </Button>
            </ModalFooter>
          </form>
        )}
      </ModalContent>
    </Modal>
  );
}
