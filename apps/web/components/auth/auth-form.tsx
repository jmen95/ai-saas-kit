"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { apiFetch, storeTokens } from "../../lib/api";
import styles from "../../app/(auth)/auth.module.css";

type AuthFormProps = {
  mode: "login" | "register";
};

export function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
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
      mode === "login"
        ? { email, password }
        : { email, password, name };

    const result = await apiFetch<{
      accessToken: string;
      refreshToken: string;
    }>(path, {
      method: "POST",
      body: JSON.stringify(body),
      auth: false,
    });

    setLoading(false);

    if (!result.ok) {
      setError(result.error.message);
      return;
    }

    storeTokens(result.data.accessToken, result.data.refreshToken);
    document.cookie = `accessToken=${result.data.accessToken}; path=/; max-age=900; SameSite=Lax`;
    router.push("/overview");
    router.refresh();
  }

  return (
    <>
      <h1 className={styles.title}>
        {mode === "login" ? "Welcome back" : "Create your account"}
      </h1>
      <p className={styles.subtitle}>
        {mode === "login"
          ? "Sign in to your AI SaaS workspace"
          : "Start building with the starter kit"}
      </p>

      <form className={styles.form} onSubmit={onSubmit}>
        {mode === "register" && (
          <label className={styles.label}>
            Name
            <input
              className={styles.input}
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </label>
        )}
        <label className={styles.label}>
          Email
          <input
            className={styles.input}
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </label>
        <label className={styles.label}>
          Password
          <input
            className={styles.input}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={8}
            required
          />
        </label>
        {error && <p className={styles.error}>{error}</p>}
        <button type="submit" className={styles.submit} disabled={loading}>
          {loading ? "Please wait…" : mode === "login" ? "Sign in" : "Sign up"}
        </button>
      </form>

      <a
        className={styles.link}
        href={mode === "login" ? "/register" : "/login"}
      >
        {mode === "login"
          ? "Need an account? Register"
          : "Already have an account? Sign in"}
      </a>
    </>
  );
}
