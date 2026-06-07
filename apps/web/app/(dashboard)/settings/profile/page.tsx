"use client";

import { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage, Button, Card, Input, Label } from "@repo/ui";
import { apiFetch } from "../../../../lib/api";
import { PageHeader } from "../../../../components/shared/page-state";

type Feedback = { type: "success" | "error"; message: string } | null;

export default function ProfileSettingsPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileFeedback, setProfileFeedback] = useState<Feedback>(null);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordFeedback, setPasswordFeedback] = useState<Feedback>(null);

  useEffect(() => {
    void apiFetch<{
      name: string | null;
      email: string;
      avatarUrl: string | null;
    }>("/users/me").then((r) => {
      if (r.ok) {
        setName(r.data.name ?? "");
        setEmail(r.data.email);
        setAvatarUrl(r.data.avatarUrl ?? "");
      }
    });
  }, []);

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault();
    setSavingProfile(true);
    setProfileFeedback(null);
    const result = await apiFetch("/users/me", {
      method: "PATCH",
      body: JSON.stringify({
        name,
        ...(avatarUrl ? { avatarUrl } : {}),
      }),
    });
    setSavingProfile(false);
    setProfileFeedback(
      result.ok
        ? { type: "success", message: "Profile updated." }
        : { type: "error", message: result.error.message },
    );
  }

  async function changePassword(e: React.FormEvent) {
    e.preventDefault();
    setSavingPassword(true);
    setPasswordFeedback(null);
    const result = await apiFetch("/users/me/password", {
      method: "PATCH",
      body: JSON.stringify({ currentPassword, newPassword }),
    });
    setSavingPassword(false);
    if (result.ok) {
      setPasswordFeedback({ type: "success", message: "Password changed." });
      setCurrentPassword("");
      setNewPassword("");
    } else {
      setPasswordFeedback({ type: "error", message: result.error.message });
    }
  }

  const initials = (name || email || "?")
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <>
      <PageHeader
        title="Profile"
        description="Manage your personal account details."
      />

      <div className="flex max-w-lg flex-col gap-6">
        <Card className="p-6">
          <form className="flex flex-col gap-4" onSubmit={saveProfile}>
            <div className="flex items-center gap-3">
              <Avatar className="h-12 w-12">
                {avatarUrl && <AvatarImage src={avatarUrl} alt={name} />}
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{name || "Your name"}</p>
                <p className="text-sm text-muted-foreground">{email}</p>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="avatar">Avatar URL</Label>
              <Input
                id="avatar"
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                placeholder="https://…"
              />
            </div>
            {profileFeedback && (
              <p
                className={
                  profileFeedback.type === "success"
                    ? "text-sm text-emerald-400"
                    : "text-sm text-destructive"
                }
              >
                {profileFeedback.message}
              </p>
            )}
            <div>
              <Button type="submit" disabled={savingProfile}>
                {savingProfile ? "Saving…" : "Save changes"}
              </Button>
            </div>
          </form>
        </Card>

        <Card className="p-6">
          <h2 className="font-semibold">Change password</h2>
          <form className="mt-4 flex flex-col gap-4" onSubmit={changePassword}>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="current">Current password</Label>
              <Input
                id="current"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                autoComplete="current-password"
                required
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="new">New password</Label>
              <Input
                id="new"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                autoComplete="new-password"
                minLength={8}
                required
              />
            </div>
            {passwordFeedback && (
              <p
                className={
                  passwordFeedback.type === "success"
                    ? "text-sm text-emerald-400"
                    : "text-sm text-destructive"
                }
              >
                {passwordFeedback.message}
              </p>
            )}
            <div>
              <Button type="submit" disabled={savingPassword}>
                {savingPassword ? "Updating…" : "Update password"}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </>
  );
}
