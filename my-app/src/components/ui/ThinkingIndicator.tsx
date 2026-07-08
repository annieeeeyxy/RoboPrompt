import { Spinner } from "@/components/ui/Spinner";

export function ThinkingIndicator({ label = "Thinking…" }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-14 text-black/50 dark:text-white/50">
      <span className="relative flex h-8 w-8 items-center justify-center">
        <span className="absolute h-full w-full animate-ping rounded-full bg-blue-500/30" />
        <Spinner className="relative h-4 w-4 border-blue-500" />
      </span>
      <p className="text-sm">{label}</p>
    </div>
  );
}
