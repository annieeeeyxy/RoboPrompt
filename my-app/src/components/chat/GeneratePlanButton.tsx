export function GeneratePlanButton({
  onClick,
  disabled,
}: {
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="self-center rounded-full border border-black/15 px-4 py-2 text-xs font-medium text-black/60 hover:border-black/30 hover:text-black disabled:opacity-40 dark:border-white/15 dark:text-white/60 dark:hover:border-white/30 dark:hover:text-white"
    >
      Generate my plan now
    </button>
  );
}
