import { notFound } from "next/navigation";
import { Markdown } from "../../components/markdown";
import { getDocContent } from "../../lib/docs";

export default function DocsIntroPage() {
  const content = getDocContent("");
  if (!content) {
    notFound();
  }

  return (
    <article className="doc-article">
      <Markdown content={content} />
    </article>
  );
}
