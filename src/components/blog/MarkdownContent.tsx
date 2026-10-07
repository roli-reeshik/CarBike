import React from "react";

interface MarkdownContentProps {
  content: string;
}

export function MarkdownContent({ content }: MarkdownContentProps) {
  if (!content) return null;

  // If content contains standard HTML tags, render directly with styled container
  const isHtml = /<\/?[a-z][\s\S]*>/i.test(content);
  if (isHtml) {
    return (
      <div
        className="blog-prose space-y-5 text-base leading-relaxed text-ink/90"
        dangerouslySetInnerHTML={{ __html: content }}
      />
    );
  }

  // Parse basic markdown blocks
  const blocks = content.split(/\n\s*\n/);

  return (
    <div className="blog-prose space-y-6 text-base leading-relaxed text-ink/90">
      {blocks.map((block, idx) => {
        const trimmed = block.trim();

        // Level 1 Heading
        if (trimmed.startsWith("# ")) {
          return (
            <h1
              key={idx}
              className="mt-8 font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl"
            >
              {renderInlineMarkdown(trimmed.slice(2))}
            </h1>
          );
        }

        // Level 2 Heading
        if (trimmed.startsWith("## ")) {
          return (
            <h2
              key={idx}
              className="mt-8 border-b border-line/60 pb-2 font-display text-2xl font-bold text-ink sm:text-3xl"
            >
              {renderInlineMarkdown(trimmed.slice(3))}
            </h2>
          );
        }

        // Level 3 Heading
        if (trimmed.startsWith("### ")) {
          return (
            <h3
              key={idx}
              className="mt-6 font-display text-xl font-semibold text-ink sm:text-2xl"
            >
              {renderInlineMarkdown(trimmed.slice(4))}
            </h3>
          );
        }

        // Blockquote
        if (trimmed.startsWith("> ")) {
          return (
            <blockquote
              key={idx}
              className="border-l-4 border-accent bg-accent-soft/30 py-3 pr-4 pl-5 italic text-ink/80 rounded-r-lg"
            >
              {renderInlineMarkdown(trimmed.replace(/^>\s*/gm, ""))}
            </blockquote>
          );
        }

        // Unordered List
        if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
          const items = trimmed.split("\n").filter((line) => line.trim().length > 0);
          return (
            <ul key={idx} className="my-4 ml-6 list-disc space-y-2 text-ink/90 marker:text-accent">
              {items.map((item, itemIdx) => (
                <li key={itemIdx}>
                  {renderInlineMarkdown(item.replace(/^[-*]\s+/, ""))}
                </li>
              ))}
            </ul>
          );
        }

        // Ordered List
        if (/^\d+\.\s+/.test(trimmed)) {
          const items = trimmed.split("\n").filter((line) => line.trim().length > 0);
          return (
            <ol key={idx} className="my-4 ml-6 list-decimal space-y-2 text-ink/90 marker:font-semibold marker:text-accent">
              {items.map((item, itemIdx) => (
                <li key={itemIdx}>
                  {renderInlineMarkdown(item.replace(/^\d+\.\s+/, ""))}
                </li>
              ))}
            </ol>
          );
        }

        // Table
        if (trimmed.includes("|") && trimmed.includes("\n")) {
          const lines = trimmed.split("\n").map((l) => l.trim()).filter(Boolean);
          if (lines.length >= 2 && lines[1].includes("-")) {
            const headerCells = lines[0]
              .split("|")
              .filter((_, i, arr) => i > 0 && i < arr.length - 1)
              .map((c) => c.trim());
            const bodyRows = lines
              .slice(2)
              .map((row) =>
                row
                  .split("|")
                  .filter((_, i, arr) => i > 0 && i < arr.length - 1)
                  .map((c) => c.trim())
              );

            return (
              <div key={idx} className="my-6 overflow-x-auto rounded-xl border border-line bg-card shadow-xs">
                <table className="w-full text-left text-sm">
                  <thead className="border-b border-line bg-paper/80 text-xs font-semibold uppercase tracking-wider text-muted">
                    <tr>
                      {headerCells.map((h, hIdx) => (
                        <th key={hIdx} className="px-4 py-3">
                          {renderInlineMarkdown(h)}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line/60">
                    {bodyRows.map((row, rIdx) => (
                      <tr key={rIdx} className="hover:bg-paper/40 transition-colors">
                        {row.map((cell, cIdx) => (
                          <td key={cIdx} className="px-4 py-3 text-ink/90">
                            {renderInlineMarkdown(cell)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
          }
        }

        // Regular Paragraph
        return (
          <p key={idx} className="leading-relaxed text-ink/90">
            {renderInlineMarkdown(trimmed)}
          </p>
        );
      })}
    </div>
  );
}

function renderInlineMarkdown(text: string): React.ReactNode {
  // Simple regex parser for bold, italic, code, and links
  const parts: React.ReactNode[] = [];
  let remaining = text;
  let key = 0;

  while (remaining.length > 0) {
    // Bold: **text**
    const boldMatch = remaining.match(/\*\*(.*?)\*\*/);
    // Inline code: `text`
    const codeMatch = remaining.match(/`(.*?)`/);
    // Link: [text](url)
    const linkMatch = remaining.match(/\[(.*?)\]\((.*?)\)/);

    // Find first occurrence
    let firstType: "bold" | "code" | "link" | null = null;
    let firstIndex = Infinity;

    if (boldMatch && boldMatch.index !== undefined && boldMatch.index < firstIndex) {
      firstIndex = boldMatch.index;
      firstType = "bold";
    }
    if (codeMatch && codeMatch.index !== undefined && codeMatch.index < firstIndex) {
      firstIndex = codeMatch.index;
      firstType = "code";
    }
    if (linkMatch && linkMatch.index !== undefined && linkMatch.index < firstIndex) {
      firstIndex = linkMatch.index;
      firstType = "link";
    }

    if (!firstType || firstIndex === Infinity) {
      parts.push(remaining);
      break;
    }

    if (firstIndex > 0) {
      parts.push(remaining.substring(0, firstIndex));
    }

    if (firstType === "bold" && boldMatch) {
      parts.push(
        <strong key={key++} className="font-semibold text-ink">
          {boldMatch[1]}
        </strong>
      );
      remaining = remaining.substring(firstIndex + boldMatch[0].length);
    } else if (firstType === "code" && codeMatch) {
      parts.push(
        <code
          key={key++}
          className="rounded bg-paper px-1.5 py-0.5 font-mono text-xs text-accent border border-line"
        >
          {codeMatch[1]}
        </code>
      );
      remaining = remaining.substring(firstIndex + codeMatch[0].length);
    } else if (firstType === "link" && linkMatch) {
      parts.push(
        <a
          key={key++}
          href={linkMatch[2]}
          className="font-medium text-accent underline decoration-accent/40 underline-offset-2 hover:decoration-accent"
        >
          {linkMatch[1]}
        </a>
      );
      remaining = remaining.substring(firstIndex + linkMatch[0].length);
    }
  }

  return <>{parts}</>;
}
