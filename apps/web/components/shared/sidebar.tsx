"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { clearTokens } from "../../lib/api";
import styles from "../../app/dashboard.module.css";

const NAV = [
  { href: "/overview", label: "Overview" },
  { href: "/chat", label: "Chat" },
  { href: "/members", label: "Members" },
  { href: "/settings/profile", label: "Settings" },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  function logout() {
    clearTokens();
    document.cookie = "accessToken=; path=/; max-age=0";
    router.push("/login");
  }

  return (
    <aside className={styles.sidebar}>
      <div className={styles.brand}>AI SaaS Kit</div>
      <nav>
        {NAV.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`${styles.navLink} ${
              pathname.startsWith(item.href) ? styles.navLinkActive : ""
            }`}
          >
            {item.label}
          </Link>
        ))}
      </nav>
      <button type="button" className={styles.logout} onClick={logout}>
        Sign out
      </button>
    </aside>
  );
}
