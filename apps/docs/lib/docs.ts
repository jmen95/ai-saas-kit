import fs from "node:fs";
import path from "node:path";

export { DOC_NAV, slugToHref } from "./docs-nav";
export type { DocNavItem } from "./docs-nav";

/** Monorepo `docs/` directory (sibling of `apps/`) */
export const DOCS_ROOT = path.join(process.cwd(), "..", "..", "docs");

export function slugToFilePath(slug: string): string {
  if (slug === "" || slug === "README") {
    return path.join(DOCS_ROOT, "README.md");
  }
  return path.join(DOCS_ROOT, `${slug}.md`);
}

export function getDocContent(slug: string): string | null {
  const filePath = slugToFilePath(slug);
  if (!fs.existsSync(filePath)) {
    return null;
  }
  return fs.readFileSync(filePath, "utf8");
}

export function getAllDocSlugs(): string[] {
  const slugs: string[] = [""];

  function walk(dir: string, prefix: string) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      if (entry.name.startsWith(".")) continue;
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(fullPath, prefix ? `${prefix}/${entry.name}` : entry.name);
      } else if (entry.name.endsWith(".md") && entry.name !== "README.md") {
        const base = entry.name.replace(/\.md$/, "");
        const slug = prefix ? `${prefix}/${base}` : base;
        if (!slugs.includes(slug)) {
          slugs.push(slug);
        }
      } else if (entry.name === "README.md" && prefix) {
        const slug = `${prefix}/README`;
        if (!slugs.includes(slug)) {
          slugs.push(slug);
        }
      }
    }
  }

  walk(DOCS_ROOT, "");
  return slugs;
}
