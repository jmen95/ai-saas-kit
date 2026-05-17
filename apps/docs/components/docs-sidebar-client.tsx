"use client";

import { usePathname } from "next/navigation";
import { DocsSidebar } from "./docs-sidebar";

function pathnameToSlug(pathname: string): string {
  const trimmed = pathname.replace(/^\//, "").replace(/\/$/, "");
  if (!trimmed) return "";
  return trimmed;
}

export function DocsSidebarClient() {
  const pathname = usePathname();
  return <DocsSidebar currentSlug={pathnameToSlug(pathname)} />;
}
