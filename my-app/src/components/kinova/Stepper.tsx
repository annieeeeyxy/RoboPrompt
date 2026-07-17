"use client";

export type StepId = string;

const DEFAULT_STEPS: { id: StepId; label: string }[] = [
  { id: "identify", label: "Identify" },
  { id: "learn", label: "Learn" },
  { id: "create", label: "Create" },
  { id: "validate", label: "Validate" },
  { id: "export", label: "Export" },
];

export function Stepper({
  done,
  active,
  steps: STEPS = DEFAULT_STEPS,
}: {
  done: Set<StepId>;
  active: StepId;
  steps?: { id: StepId; label: string }[];
}) {
  return (
    <nav aria-label="Workflow steps" className="flex flex-wrap items-center gap-2">
      {STEPS.map((step, i) => {
        const isDone = done.has(step.id);
        const isActive = step.id === active;
        return (
          <a
            key={step.id}
            href={`#${step.id}`}
            className={`flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors ${
              isActive
                ? "border-cyan-400/60 bg-cyan-400/10 text-cyan-300"
                : isDone
                  ? "border-emerald-500/40 bg-emerald-500/5 text-emerald-300"
                  : "border-white/10 text-white/50 hover:text-white/80"
            }`}
          >
            <span
              className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-semibold ${
                isDone ? "bg-emerald-500/20 text-emerald-300" : isActive ? "bg-cyan-400/20 text-cyan-300" : "bg-white/10"
              }`}
            >
              {isDone ? "✓" : i + 1}
            </span>
            {step.label}
          </a>
        );
      })}
    </nav>
  );
}
