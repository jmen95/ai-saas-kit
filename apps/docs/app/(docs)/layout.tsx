import type { Metadata } from "next";
import { DocsSidebarClient } from "../../components/docs-sidebar-client";
import "../docs.css";

export const metadata: Metadata = {
  title: {
    default: "AI SaaS Starter Kit — Docs",
    template: "%s · AI SaaS Kit Docs",
  },
  description: "Documentation for the AI SaaS Starter Kit",
};

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="docs-shell">
      <DocsSidebarClient />
      <main className="docs-main">{children}</main>
    </div>
  );
}
