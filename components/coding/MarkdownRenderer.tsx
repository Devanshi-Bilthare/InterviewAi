"use client";

import { cn } from "@/lib/utils";

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export function MarkdownRenderer({ content, className }: MarkdownRendererProps) {
  const blocks = content.split(/(```[\s\S]*?```)/g);

  return (
    <div className={cn("space-y-3 text-sm leading-relaxed text-text-primary", className)}>
      {blocks.map((block, index) => {
        if (block.startsWith("```")) {
          const code = block.replace(/```\w*\n?/, "").replace(/```$/, "");
          return (
            <pre
              key={index}
              className="overflow-x-auto rounded-lg border border-deep-border bg-deep-bg p-3 font-mono text-xs text-intelligence-violet"
            >
              {code.trim()}
            </pre>
          );
        }

        return (
          <div key={index} className="space-y-2">
            {block.split("\n").map((line, lineIndex) => {
              if (line.startsWith("## ")) {
                return (
                  <h3
                    key={lineIndex}
                    className="font-display text-base font-semibold text-text-primary"
                  >
                    {line.replace("## ", "")}
                  </h3>
                );
              }
              if (line.startsWith("- ")) {
                return (
                  <p key={lineIndex} className="text-text-secondary">
                    • {formatInline(line.replace("- ", ""))}
                  </p>
                );
              }
              if (!line.trim()) return null;
              return (
                <p key={lineIndex} className="text-text-secondary">
                  {formatInline(line)}
                </p>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}

function formatInline(text: string) {
  const parts = text.split(/(`[^`]+`)/g);
  return parts.map((part, i) => {
    if (part.startsWith("`") && part.endsWith("`")) {
      return (
        <code
          key={i}
          className="rounded bg-deep-bg px-1.5 py-0.5 font-mono text-xs text-intelligence-primary"
        >
          {part.slice(1, -1)}
        </code>
      );
    }
    return <span key={i}>{part}</span>;
  });
}
