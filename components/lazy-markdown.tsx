import dynamic from "next/dynamic";

export const LazyMarkdownText = dynamic(
  () => import("./markdown-text").then((mod) => ({ default: mod.MarkdownText })),
  {
    ssr: false,
    loading: () => (
      <div className="space-y-2">
        <div className="animate-pulse bg-bg-surface rounded h-4 w-3/4" />
        <div className="animate-pulse bg-bg-surface rounded h-4 w-1/2" />
      </div>
    ),
  }
);
