export function ImageThumbnails({
  urls,
  onRemove,
  disabled,
}: {
  urls: string[];
  onRemove?: (index: number) => void;
  disabled?: boolean;
}) {
  if (urls.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-3">
      {urls.map((url, i) => (
        <div key={url} className="group relative h-24 w-24 shrink-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={url}
            alt={`Uploaded robot arm photo ${i + 1}`}
            className="h-full w-full rounded-xl border border-black/10 object-cover dark:border-white/10"
          />
          {onRemove && (
            <button
              type="button"
              onClick={() => onRemove(i)}
              disabled={disabled}
              aria-label="Remove photo"
              className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-black/70 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100 disabled:opacity-0 dark:bg-white/80 dark:text-black"
            >
              ×
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
