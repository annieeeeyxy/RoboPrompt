import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export function PlanView({
  markdown,
  isStreaming,
  onStartOver,
  actions,
}: {
  markdown: string;
  isStreaming: boolean;
  onStartOver: () => void;
  actions?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-6">
      <div className="prose prose-sm dark:prose-invert max-w-none prose-headings:font-semibold prose-pre:bg-black/5 dark:prose-pre:bg-white/10">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{markdown}</ReactMarkdown>
        {isStreaming && <span className="animate-pulse">▍</span>}
      </div>
      {!isStreaming && (
        <div className="flex flex-wrap items-center gap-3">
          {actions}
          <button
            onClick={onStartOver}
            className="rounded-full border border-black/15 px-4 py-2 text-xs font-medium text-black/60 hover:border-black/30 hover:text-black dark:border-white/15 dark:text-white/60 dark:hover:border-white/30 dark:hover:text-white"
          >
            Start over with a new arm
          </button>
        </div>
      )}
    </div>
  );
}
