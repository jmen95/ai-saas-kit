import Link from "next/link";
import { DOC_NAV, slugToHref } from "../lib/docs-nav";

type DocsSidebarProps = {
  currentSlug: string;
};

export function DocsSidebar({ currentSlug }: DocsSidebarProps) {
  return (
    <aside className="docs-sidebar">
      <div className="docs-sidebar-header">
        <Link href="/" className="docs-brand">
          AI SaaS Kit
        </Link>
        <span className="docs-brand-sub">Documentation</span>
      </div>
      <nav className="docs-nav" aria-label="Documentation">
        {DOC_NAV.map((item) => {
          const href = slugToHref(item.slug);
          const isActive =
            item.slug === currentSlug ||
            (item.slug === "" && currentSlug === "README");
          return (
            <Link
              key={item.slug || "intro"}
              href={href}
              className={`docs-nav-link${isActive ? " docs-nav-link-active" : ""}`}
            >
              {item.title}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
