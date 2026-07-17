"use client";

import { useState } from "react";
import type { InferredParam } from "@/lib/kortex/types";

type Orientation = { thetaX: number; thetaY: number; thetaZ: number };

function ConfidenceBadge({ confidence, confirmed }: { confidence: number; confirmed: boolean }) {
  if (confirmed) {
    return (
      <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-300">
        Confirmed
      </span>
    );
  }
  return (
    <span className="rounded-full bg-amber-500/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-300">
      Needs confirmation · {(confidence * 100).toFixed(0)}%
    </span>
  );
}

export function NumberParamRow({
  label,
  unit,
  param,
  digits = 4,
  onConfirm,
  onEdit,
}: {
  label: string;
  unit: string;
  param: InferredParam<number>;
  digits?: number;
  onConfirm: () => void;
  onEdit: (value: number) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");

  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-medium text-white/90">{label}</p>
        <ConfidenceBadge confidence={param.confidence} confirmed={param.confirmedByUser} />
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-3">
        {editing ? (
          <>
            <input
              autoFocus
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              className="w-32 rounded-lg border border-cyan-400/40 bg-black/40 px-3 py-1.5 font-mono text-sm text-cyan-200 outline-none focus:border-cyan-400"
            />
            <span className="text-xs text-white/40">{unit}</span>
            <button
              onClick={() => {
                const v = Number(draft);
                if (Number.isFinite(v)) {
                  onEdit(v);
                  setEditing(false);
                }
              }}
              className="rounded-full bg-cyan-500/90 px-3 py-1 text-xs font-medium text-black hover:bg-cyan-400"
            >
              Save
            </button>
            <button onClick={() => setEditing(false)} className="text-xs text-white/50 hover:text-white/80">
              Cancel
            </button>
          </>
        ) : (
          <>
            <span className="font-mono text-lg text-cyan-200">
              {param.value === null ? "—" : param.value.toFixed(digits)}
            </span>
            <span className="text-xs text-white/40">{unit}</span>
            <div className="ml-auto flex gap-2">
              {param.value !== null && !param.confirmedByUser && (
                <button
                  onClick={onConfirm}
                  className="rounded-full bg-emerald-500/90 px-3 py-1 text-xs font-medium text-black hover:bg-emerald-400"
                >
                  Confirm
                </button>
              )}
              <button
                onClick={() => {
                  setDraft(param.value === null ? "" : String(param.value.toFixed(digits)));
                  setEditing(true);
                }}
                className="rounded-full border border-white/15 px-3 py-1 text-xs text-white/70 hover:border-cyan-400/50 hover:text-cyan-300"
              >
                Edit
              </button>
            </div>
          </>
        )}
      </div>
      <p className="mt-2 text-xs leading-5 text-white/45">
        <span className="text-white/60">Source:</span> <span className="font-mono">{param.sourceAction}</span>
      </p>
      <p className="mt-1 text-xs leading-5 text-white/45">{param.reason}</p>
    </div>
  );
}

export function OrientationParamRow({
  param,
  onConfirm,
  onEdit,
}: {
  param: InferredParam<Orientation>;
  onConfirm: () => void;
  onEdit: (value: Orientation) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<{ x: string; y: string; z: string }>({ x: "", y: "", z: "" });

  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-medium text-white/90">Tool orientation (θX / θY / θZ)</p>
        <ConfidenceBadge confidence={param.confidence} confirmed={param.confirmedByUser} />
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-3">
        {editing ? (
          <>
            {(["x", "y", "z"] as const).map((axis) => (
              <input
                key={axis}
                value={draft[axis]}
                onChange={(e) => setDraft({ ...draft, [axis]: e.target.value })}
                placeholder={`θ${axis.toUpperCase()}`}
                className="w-24 rounded-lg border border-cyan-400/40 bg-black/40 px-3 py-1.5 font-mono text-sm text-cyan-200 outline-none focus:border-cyan-400"
              />
            ))}
            <span className="text-xs text-white/40">deg</span>
            <button
              onClick={() => {
                const v = { thetaX: Number(draft.x), thetaY: Number(draft.y), thetaZ: Number(draft.z) };
                if ([v.thetaX, v.thetaY, v.thetaZ].every(Number.isFinite)) {
                  onEdit(v);
                  setEditing(false);
                }
              }}
              className="rounded-full bg-cyan-500/90 px-3 py-1 text-xs font-medium text-black hover:bg-cyan-400"
            >
              Save
            </button>
            <button onClick={() => setEditing(false)} className="text-xs text-white/50 hover:text-white/80">
              Cancel
            </button>
          </>
        ) : (
          <>
            <span className="font-mono text-lg text-cyan-200">
              {param.value === null
                ? "—"
                : `${param.value.thetaX.toFixed(1)}° / ${param.value.thetaY.toFixed(1)}° / ${param.value.thetaZ.toFixed(1)}°`}
            </span>
            <div className="ml-auto flex gap-2">
              {param.value !== null && !param.confirmedByUser && (
                <button
                  onClick={onConfirm}
                  className="rounded-full bg-emerald-500/90 px-3 py-1 text-xs font-medium text-black hover:bg-emerald-400"
                >
                  Confirm
                </button>
              )}
              <button
                onClick={() => {
                  setDraft(
                    param.value === null
                      ? { x: "", y: "", z: "" }
                      : {
                          x: param.value.thetaX.toFixed(2),
                          y: param.value.thetaY.toFixed(2),
                          z: param.value.thetaZ.toFixed(2),
                        }
                  );
                  setEditing(true);
                }}
                className="rounded-full border border-white/15 px-3 py-1 text-xs text-white/70 hover:border-cyan-400/50 hover:text-cyan-300"
              >
                Edit
              </button>
            </div>
          </>
        )}
      </div>
      <p className="mt-2 text-xs leading-5 text-white/45">
        <span className="text-white/60">Source:</span> <span className="font-mono">{param.sourceAction}</span>
      </p>
      <p className="mt-1 text-xs leading-5 text-white/45">{param.reason}</p>
    </div>
  );
}
