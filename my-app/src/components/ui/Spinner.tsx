import { cn } from "@/lib/cn";

export function Spinner({
  className = "",
  ariaLabel = "Loading",
}: {
  className?: string;
  ariaLabel?: string;
}) {
  return (
    <span
      className={cn(
        "inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent",
        className
      )}
      role="status"
      aria-label={ariaLabel}
    />
  );
}
