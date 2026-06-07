"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Button, Input, Label } from "@repo/ui";
import { apiFetch, setSession } from "../../lib/api";

type AuthFormProps = {
  mode: "login" | "register";
};

function safeNext(next: string | null): string {
  // Only allow internal, single-slash-prefixed paths to avoid open redirects.
  if (next && next.startsWith("/") && !next.startsWith("//")) return next;
  return "/overview";
}

export function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = safeNext(searchParams.get("next"));
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const path = mode === "login" ? "/auth/login" : "/auth/register";
    const body =
      mode === "login" ? { email, password } : { email, password, name };

    const result = await apiFetch<{
      accessToken: string;
      refreshToken: string;
    }>(path, {
      method: "POST",
      body: JSON.stringify(body),
      auth: false,
    });

    if (!result.ok) {
      setLoading(false);
      setError(result.error.message);
      return;
    }

    setSession(result.data.accessToken, result.data.refreshToken);
    router.push(next);
    router.refresh();
  }

  return (
    <div className="w-full">
      <h1 className="text-2xl font-bold tracking-tight">
        {mode === "login" ? "Welcome back" : "Create your account"}
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">
        {mode === "login"
          ? "Sign in to your AI SaaS workspace"
          : "Spin up a workspace in seconds"}
      </p>

      <form className="mt-6 flex flex-col gap-4" onSubmit={onSubmit}>
        {mode === "register" && (
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ada Lovelace"
              required
            />
          </div>
        )}
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@company.com"
            autoComplete="email"
            required
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="At least 8 characters"
            autoComplete={
              mode === "login" ? "current-password" : "new-password"
            }
            minLength={8}
            required
          />
        </div>
        {error && (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        )}
        <Button type="submit" disabled={loading} className="mt-1">
          {loading
            ? "Please wait…"
            : mode === "login"
              ? "Sign in"
              : "Create account"}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        {mode === "login" ? (
          <>
            Need an account?{" "}
            <Link href="/register" className="text-primary hover:underline">
              Register
            </Link>
          </>
        ) : (
          <>
            Already have an account?{" "}
            <Link href="/login" className="text-primary hover:underline">
              Sign in
            </Link>
          </>
        )}
      </p>
    </div>
  );
}
