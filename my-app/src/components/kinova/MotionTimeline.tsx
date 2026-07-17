"use client";

import type { PlannedStep } from "@/lib/kortex/types";
import { SEGMENT_COLORS, SEGMENT_LABELS, stepSegmentKey } from "./pathTheme";

export function MotionTimeline({ plan }: { plan: PlannedStep[] }) {
  return (
    <ol className="flex flex-col gap-1.5">
      {plan.map((step, i) => {
        const key = stepSegmentKey(step);
        return (
          <li
            key={`${step.type}-${i}`}
            className="flex items-center gap-3 rounded-lg border border-white/5 bg-white/[0.02] px-3 py-2"
          >
            <span className="w-5 text-right font-mono text-xs text-white/35">{i + 1}</span>
            <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: SEGMENT_COLORS[key] }} />
            <span className="w-36 shrink-0 font-mono text-xs font-semibold tracking-wide text-white/90">
              {step.type}
            </span>
            <span className="font-mono text-xs text-white/50">
              {step.pose
                ? `x ${step.pose.x.toFixed(3)}  y ${step.pose.y.toFixed(3)}  z ${step.pose.z.toFixed(3)} m`
                : `gripper → ${step.gripperValue?.toFixed(3)}`}
            </span>
            <span className="ml-auto hidden text-[10px] uppercase tracking-wide text-white/30 sm:block">
              {SEGMENT_LABELS[key]}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
