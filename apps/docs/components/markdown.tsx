import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

type MarkdownProps = {
  content: string;
};

export function Markdown({ content }: MarkdownProps) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        h1: ({ children }) => <h1 className="doc-h1">{children}</h1>,
        h2: ({ children }) => <h2 className="doc-h2">{children}</h2>,
        h3: ({ children }) => <h3 className="doc-h3">{children}</h3>,
        p: ({ children }) => <p className="doc-p">{children}</p>,
        ul: ({ children }) => <ul className="doc-ul">{children}</ul>,
        ol: ({ children }) => <ol className="doc-ol">{children}</ol>,
        li: ({ children }) => <li className="doc-li">{children}</li>,
        a: ({ href, children }) => (
          <a
            href={href}
            className="doc-a"
            target={href?.startsWith("http") ? "_blank" : undefined}
            rel={href?.startsWith("http") ? "noopener noreferrer" : undefined}
          >
            {children}
          </a>
        ),
        code: ({ className, children }) => {
          const isBlock = className?.includes("language-");
          if (isBlock) {
            return (
              <code className={`doc-code-block ${className ?? ""}`}>
                {children}
              </code>
            );
          }
          return <code className="doc-code-inline">{children}</code>;
        },
        pre: ({ children }) => <pre className="doc-pre">{children}</pre>,
        table: ({ children }) => (
          <div className="doc-table-wrap">
            <table className="doc-table">{children}</table>
          </div>
        ),
        blockquote: ({ children }) => (
          <blockquote className="doc-blockquote">{children}</blockquote>
        ),
      }}
    >
      {content}
    </ReactMarkdown>
  );
}
