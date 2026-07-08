const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

function formatDate(iso: string): string {
  const [, month, day] = iso.split("-").map(Number);
  return `${MONTHS[month - 1]} ${day}`;
}

const MAX_BAR_HEIGHT = 96;

export function ActivityChart({
  data,
}: {
  data: { date: string; commits: number }[];
}) {
  const max = Math.max(...data.map((d) => d.commits));

  return (
    <div className="rounded-2xl border border-black/10 p-5 dark:border-white/10">
      <p className="text-xs font-medium uppercase tracking-wide text-black/40 dark:text-white/40">
        Commit activity
      </p>
      <div className="mt-4 flex items-end gap-6 border-b border-black/15 pb-2 dark:border-white/15">
        {data.map((d) => {
          const height = Math.max(4, (d.commits / max) * MAX_BAR_HEIGHT);
          return (
            <div key={d.date} className="flex w-6 flex-col items-center gap-1.5">
              <span className="text-xs font-medium text-black/60 dark:text-white/70">
                {d.commits}
              </span>
              <div
                className="w-6 rounded-t-[4px] bg-[#2a78d6] transition-opacity hover:opacity-80 dark:bg-[#3987e5]"
                style={{ height }}
                title={`${formatDate(d.date)}: ${d.commits} commit${d.commits === 1 ? "" : "s"}`}
              />
            </div>
          );
        })}
      </div>
      <div className="mt-2 flex gap-6">
        {data.map((d) => (
          <span key={d.date} className="w-6 text-center text-xs text-black/40 dark:text-white/40">
            {formatDate(d.date)}
          </span>
        ))}
      </div>
    </div>
  );
}
