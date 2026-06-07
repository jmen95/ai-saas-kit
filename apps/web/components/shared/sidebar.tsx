"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Avatar, AvatarFallback, Button, cn } from "@repo/ui";
import { apiFetch, logout } from "../../lib/api";

const NAV = [
  { href: "/overview", label: "Overview" },
  { href: "/chat", label: "Chat" },
  { href: "/members", label: "Members" },
  { href: "/settings/profile", label: "Profile" },
  { href: "/settings/billing", label: "Billing" },
];

type Me = { name: string | null; email: string };

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [me, setMe] = useState<Me | null>(null);

  useEffect(() => {
    void apiFetch<Me>("/users/me").then((r) => {
      if (r.ok) setMe(r.data);
    });
  }, []);

  async function onLogout() {
    await logout();
    router.push("/login");
    router.refresh();
  }

  const initials = (me?.name ?? me?.email ?? "?")
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <aside className="flex w-60 shrink-0 flex-col border-r border-border bg-sidebar p-4">
      <Link href="/overview" className="mb-6 px-2 text-base font-bold">
        AI SaaS Kit
      </Link>
      <nav className="flex flex-col gap-1">
        {NAV.map((item) => {
          const active =
            item.href === "/settings/profile"
              ? pathname === item.href
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground",
                active && "bg-accent text-foreground",
              )}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto flex flex-col gap-3 pt-4">
        <div className="flex items-center gap-2 px-1">
          <Avatar className="h-8 w-8">
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">
              {me?.name ?? "Loading…"}
            </p>
            <p className="truncate text-xs text-muted-foreground">
              {me?.email ?? ""}
            </p>
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={onLogout}>
          Sign out
        </Button>
      </div>
    </aside>
  );
}
