import { notFound } from "next/navigation";
import { Markdown } from "../../../components/markdown";
import { getAllDocSlugs, getDocContent } from "../../../lib/docs";

type PageProps = {
  params: Promise<{ slug: string[] }>;
};

function resolveSlug(segments: string[]): string {
  if (segments.length === 0) return "";
  return segments.join("/");
}

export function generateStaticParams() {
  return getAllDocSlugs()
    .filter((slug) => slug !== "")
    .map((slug) => ({
      slug: slug.split("/"),
    }));
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const docSlug = resolveSlug(slug);
  const content = getDocContent(docSlug);
  if (!content) return { title: "Not found" };

  const titleMatch = content.match(/^#\s+(.+)$/m);
  return {
    title: titleMatch?.[1] ?? docSlug,
  };
}

export default async function DocPage({ params }: PageProps) {
  const { slug } = await params;
  const docSlug = resolveSlug(slug);
  const content = getDocContent(docSlug);

  if (!content) {
    notFound();
  }

  return (
    <article className="doc-article">
      <Markdown content={content} />
    </article>
  );
}
