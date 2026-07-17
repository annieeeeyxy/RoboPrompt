import type { PlannedStep } from "@/lib/kortex/types";

export type SegmentKey = "travel" | "descendPick" | "grip" | "carry" | "descendPlace" | "retreat";

export const SEGMENT_COLORS: Record<SegmentKey, string> = {
  travel: "#22d3ee", // cyan — empty move (dashed when drawn)
  descendPick: "#f59e0b", // amber — descending to pick
  grip: "#34d399", // green — gripper events
  carry: "#38bdf8", // solid blue — carrying the object
  descendPlace: "#a78bfa", // violet — descending to place
  retreat: "#64748b", // slate — retreat to safe height
};

export const SEGMENT_LABELS: Record<SegmentKey, string> = {
  travel: "Empty move",
  descendPick: "Descend to pick",
  grip: "Grip / release",
  carry: "Carrying object",
  descendPlace: "Descend to place",
  retreat: "Retreat",
};

export function stepSegmentKey(step: PlannedStep): SegmentKey {
  if (step.segment === "gripper") return "grip";
  if (step.segment === "carry") return "carry";
  if (step.segment === "retreat") return "retreat";
  if (step.segment === "descend") return step.type === "PLACE" ? "descendPlace" : "descendPick";
  return "travel";
}
