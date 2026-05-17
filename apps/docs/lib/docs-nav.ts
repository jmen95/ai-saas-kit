export type DocNavItem = {
  title: string;
  slug: string;
};

export const DOC_NAV: DocNavItem[] = [
  { title: "Introduction", slug: "" },
  { title: "Getting started", slug: "getting-started" },
  { title: "Architecture", slug: "architecture" },
  { title: "Features", slug: "features" },
  { title: "API reference", slug: "api" },
  { title: "Environment variables", slug: "environment" },
  { title: "Deployment", slug: "deployment" },
  { title: "Master plan", slug: "master-plan" },
  { title: "Architecture decisions", slug: "adr/README" },
];

export function slugToHref(slug: string): string {
  if (slug === "") return "/";
  return `/${slug}`;
}
