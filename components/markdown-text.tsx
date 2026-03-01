"use client";

import ReactMarkdown from "react-markdown";
import { decodeHtmlEntities } from "@/lib/utils";

interface MarkdownTextProps {
  content: string;
  className?: string;
}

export function MarkdownText({ content, className = "" }: MarkdownTextProps) {
  const decoded = decodeHtmlEntities(content);
  return (
    <div className={className}>
      <ReactMarkdown
        components={{
          p: ({ children }) => <span className="block mb-2 last:mb-0">{children}</span>,
          strong: ({ children }) => (
            <strong className="font-bold text-text-primary">{children}</strong>
          ),
          em: ({ children }) => <em className="italic">{children}</em>,
          h1: ({ children }) => (
            <span className="block text-lg font-bold font-display text-amber mb-2">
              {children}
            </span>
          ),
          h2: ({ children }) => (
            <span className="block text-base font-bold font-display text-amber mb-1.5">
              {children}
            </span>
          ),
          h3: ({ children }) => (
            <span className="block text-sm font-bold font-display text-amber mb-1">
              {children}
            </span>
          ),
          ul: ({ children }) => (
            <ul className="list-none space-y-1 my-1">{children}</ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal list-inside space-y-1 my-1">{children}</ol>
          ),
          li: ({ children }) => (
            <li className="flex items-start gap-1.5">
              <span className="text-amber shrink-0 mt-0.5">◆</span>
              <span>{children}</span>
            </li>
          ),
          blockquote: ({ children }) => (
            <blockquote className="border-l-2 border-amber/30 pl-3 italic text-text-secondary my-2">
              {children}
            </blockquote>
          ),
          code: ({ children }) => (
            <code className="text-amber font-mono text-xs bg-bg-surface px-1 py-0.5 rounded">
              {children}
            </code>
          ),
          hr: () => <hr className="border-border/30 my-3" />,
        }}
      >
        {decoded}
      </ReactMarkdown>
    </div>
  );
}
