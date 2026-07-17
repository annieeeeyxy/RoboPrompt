"use client";

import type { PlannedStep } from "@/lib/kortex/types";
import { SEGMENT_COLORS, SEGMENT_LABELS, stepSegmentKey, type SegmentKey } from "./pathTheme";

type Bounds = { minX: number; maxX: number; minY: number; maxY: number; minZ: number; maxZ: number } | null;

const W = 460;
const H = 280;
const PAD = 36;

function makeScale(min: number, max: number, outMin: number, outMax: number) {
  const span = max - min || 1;
  return (v: number) => outMin + ((v - min) / span) * (outMax - outMin);
}

/**
 * 2D path preview: top view (X/Y) and side view (X/Z). Segment colors match
 * the motion timeline; the demonstrated workspace is drawn as a faint box so
 * out-of-range targets are visually obvious.
 */
export function PathPreview({
  plan,
  bounds,
  showRobotBase = false,
}: {
  plan: PlannedStep[];
  bounds: Bounds;
  showRobotBase?: boolean;
}) {
  const posePoints = plan
    .map((step, i) => ({ step, i }))
    .filter((p): p is { step: PlannedStep & { pose: NonNullable<PlannedStep["pose"]> }; i: number } =>
      Boolean(p.step.pose)
    );
  if (posePoints.length < 2) return null;

  const baseXs = showRobotBase ? [0] : [];
  const xs = posePoints
    .map((p) => p.step.pose.x)
    .concat(bounds ? [bounds.minX, bounds.maxX] : [])
    .concat(baseXs);
  const ys = posePoints
    .map((p) => p.step.pose.y)
    .concat(bounds ? [bounds.minY, bounds.maxY] : [])
    .concat(showRobotBase ? [0] : []);
  const zs = posePoints.map((p) => p.step.pose.z).concat(bounds ? [bounds.minZ, bounds.maxZ] : []);
  const margin = 0.03;
  const sxTop = makeScale(Math.min(...xs) - margin, Math.max(...xs) + margin, PAD, W - PAD);
  const syTop = makeScale(Math.min(...ys) - margin, Math.max(...ys) + margin, H - PAD, PAD);
  const sxSide = sxTop;
  const szSide = makeScale(Math.min(...zs) - margin, Math.max(...zs) + margin, H - PAD, PAD);

  const gripMarkers: { afterIndex: number; key: SegmentKey }[] = [];
  plan.forEach((step, i) => {
    if (step.segment === "gripper") {
      // marker sits at the most recent pose before this gripper event (or the first pose)
      const prior = [...plan.slice(0, i)].reverse().find((s) => s.pose);
      const anchor = prior ?? plan.find((s) => s.pose);
      if (anchor?.pose) {
        gripMarkers.push({ afterIndex: plan.indexOf(anchor), key: "grip" });
      }
    }
  });

  function renderView(
    project: (p: { x: number; y: number; z: number }) => [number, number],
    axisLabels: [string, string],
    withBase = false
  ) {
    const segments: React.ReactNode[] = [];
    for (let i = 1; i < posePoints.length; i++) {
      const from = posePoints[i - 1].step.pose;
      const to = posePoints[i].step.pose;
      const key = stepSegmentKey(posePoints[i].step);
      const [x1, y1] = project(from);
      const [x2, y2] = project(to);
      segments.push(
        <line
          key={i}
          x1={x1}
          y1={y1}
          x2={x2}
          y2={y2}
          stroke={SEGMENT_COLORS[key]}
          strokeWidth={key === "carry" ? 3 : 2}
          strokeDasharray={key === "travel" || key === "retreat" ? "6 4" : undefined}
          strokeLinecap="round"
        />
      );
    }
    return (
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full rounded-xl border border-white/10 bg-black/30">
        {bounds && (
          <rect
            x={Math.min(project({ x: bounds.minX, y: bounds.minY, z: bounds.minZ })[0], project({ x: bounds.maxX, y: bounds.maxY, z: bounds.maxZ })[0])}
            y={Math.min(project({ x: bounds.minX, y: bounds.minY, z: bounds.minZ })[1], project({ x: bounds.maxX, y: bounds.maxY, z: bounds.maxZ })[1])}
            width={Math.abs(project({ x: bounds.maxX, y: bounds.maxY, z: bounds.maxZ })[0] - project({ x: bounds.minX, y: bounds.minY, z: bounds.minZ })[0])}
            height={Math.abs(project({ x: bounds.maxX, y: bounds.maxY, z: bounds.maxZ })[1] - project({ x: bounds.minX, y: bounds.minY, z: bounds.minZ })[1])}
            fill="rgba(34,211,238,0.04)"
            stroke="rgba(34,211,238,0.25)"
            strokeDasharray="3 3"
          />
        )}
        {withBase &&
          (() => {
            const [bx, by] = project({ x: 0, y: 0, z: 0 });
            return (
              <g>
                <rect x={bx - 7} y={by - 7} width={14} height={14} rx={3} fill="#0D1524" stroke="#e2e8f0" strokeWidth={1.5} />
                <text x={bx + 11} y={by + 4} fontSize={9} fill="rgba(255,255,255,0.55)" fontFamily="monospace">
                  BASE
                </text>
              </g>
            );
          })()}
        {segments}
        {posePoints.map(({ step }, i) => {
          const [cx, cy] = project(step.pose);
          return (
            <g key={i}>
              <circle cx={cx} cy={cy} r={4} fill="#0D1524" stroke={SEGMENT_COLORS[stepSegmentKey(step)]} strokeWidth={2} />
              <text x={cx + 7} y={cy - 6} fontSize={9} fill="rgba(255,255,255,0.55)" fontFamily="monospace">
                {step.type}
              </text>
            </g>
          );
        })}
        {gripMarkers.map((m, i) => {
          const anchor = plan[m.afterIndex];
          if (!anchor?.pose) return null;
          const [cx, cy] = project(anchor.pose);
          return <circle key={`g${i}`} cx={cx} cy={cy} r={8} fill="none" stroke={SEGMENT_COLORS.grip} strokeWidth={1.5} />;
        })}
        <text x={W - PAD} y={H - 10} fontSize={10} fill="rgba(255,255,255,0.35)" textAnchor="end" fontFamily="monospace">
          {axisLabels[0]}
        </text>
        <text x={12} y={PAD} fontSize={10} fill="rgba(255,255,255,0.35)" fontFamily="monospace">
          {axisLabels[1]}
        </text>
      </svg>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="grid gap-3 lg:grid-cols-2">
        <div>
          <p className="mb-1.5 text-xs font-medium uppercase tracking-wide text-white/40">Top view (X–Y)</p>
          {renderView((p) => [sxTop(p.x), syTop(p.y)], ["x (m)", "y (m)"], showRobotBase)}
        </div>
        <div>
          <p className="mb-1.5 text-xs font-medium uppercase tracking-wide text-white/40">Side view (X–Z)</p>
          {renderView((p) => [sxSide(p.x), szSide(p.z)], ["x (m)", "z (m)"])}
        </div>
      </div>
      <div className="flex flex-wrap gap-x-4 gap-y-1.5">
        {(Object.keys(SEGMENT_LABELS) as SegmentKey[]).map((key) => (
          <span key={key} className="flex items-center gap-1.5 text-[11px] text-white/50">
            <span className="h-2 w-4 rounded-sm" style={{ background: SEGMENT_COLORS[key] }} />
            {SEGMENT_LABELS[key]}
          </span>
        ))}
        <span className="flex items-center gap-1.5 text-[11px] text-white/50">
          <span className="h-2 w-4 rounded-sm border border-dashed border-cyan-400/40" />
          Demonstrated workspace
        </span>
      </div>
    </div>
  );
}
