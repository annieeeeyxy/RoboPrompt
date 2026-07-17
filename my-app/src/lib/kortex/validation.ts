import type {
  PickPlaceInput,
  PlannedStep,
  ValidationItem,
  WorkspaceProfile,
} from "./types";

const MIN_CLEARANCE_M = 0.05;
const RANGE_WARNING_MARGIN_M = 0.1;
const BELOW_TABLE_TOLERANCE_M = 0.005;

/**
 * Safety validation for a planned pick-and-place. Errors block generation;
 * warnings are shown but do not block (the user is told to verify in Kortex
 * either way — this app never drives the arm).
 */
export function validatePlan(
  input: PickPlaceInput,
  profile: WorkspaceProfile,
  plan: PlannedStep[] | null
): ValidationItem[] {
  const items: ValidationItem[] = [];

  // 1. Every required parameter confirmed.
  const required: [string, { value: unknown; confirmedByUser: boolean }][] = [
    ["Table height", profile.estimatedTableHeight],
    ["Safe travel height", profile.safeTravelHeight],
    ["Tool orientation", profile.toolOrientation],
    ["Gripper open value", profile.gripperOpenValue],
    ["Gripper close value", profile.gripperCloseValue],
    ["Default speed", profile.defaultSpeed],
  ];
  for (const [label, param] of required) {
    if (param.value === null) {
      items.push({ level: "error", message: `${label}: no value — edit and confirm it in the Workspace Profile.` });
    } else if (!param.confirmedByUser) {
      items.push({ level: "error", message: `${label}: not confirmed yet — review it in the Workspace Profile.` });
    }
  }

  const table = profile.estimatedTableHeight.value;
  const safe = profile.safeTravelHeight.value;

  // 2. Pick/Place Z below the confirmed table height would drive into the table.
  if (table !== null) {
    const pickZ = input.pickZ ?? table;
    const placeZ = input.placeZ ?? table;
    if (pickZ < table - BELOW_TABLE_TOLERANCE_M) {
      items.push({
        level: "error",
        message: `Pick Z (${pickZ.toFixed(4)} m) is below the confirmed table height (${table.toFixed(4)} m) — the arm would press into the surface.`,
      });
    }
    if (placeZ < table - BELOW_TABLE_TOLERANCE_M) {
      items.push({
        level: "error",
        message: `Place Z (${placeZ.toFixed(4)} m) is below the confirmed table height (${table.toFixed(4)} m) — the arm would press into the surface.`,
      });
    }

    // 3. Safe height must clear the contact heights by a real margin.
    if (safe !== null) {
      const highestContact = Math.max(pickZ, placeZ);
      if (safe <= highestContact) {
        items.push({
          level: "error",
          message: `Safe travel height (${safe.toFixed(4)} m) is not above the pick/place heights — the arm would drag the object across the table.`,
        });
      } else if (safe < highestContact + MIN_CLEARANCE_M) {
        items.push({
          level: "warning",
          message: `Safe travel height clears the pick/place heights by only ${((safe - highestContact) * 1000).toFixed(0)} mm — consider at least ${MIN_CLEARANCE_M * 1000} mm.`,
        });
      }
    }
  }

  // 4. Coordinates vs the demonstrated range.
  if (profile.bounds) {
    const b = profile.bounds;
    const points: [string, number, number][] = [
      ["Pick", input.pickX, input.pickY],
      ["Place", input.placeX, input.placeY],
    ];
    for (const [label, x, y] of points) {
      const inside = x >= b.minX && x <= b.maxX && y >= b.minY && y <= b.maxY;
      const nearby =
        x >= b.minX - RANGE_WARNING_MARGIN_M &&
        x <= b.maxX + RANGE_WARNING_MARGIN_M &&
        y >= b.minY - RANGE_WARNING_MARGIN_M &&
        y <= b.maxY + RANGE_WARNING_MARGIN_M;
      if (inside) continue;
      if (nearby) {
        items.push({
          level: "warning",
          message: `${label} (${x.toFixed(3)}, ${y.toFixed(3)}) is outside the demonstrated area but within 10 cm of it — reach and collisions were not demonstrated there.`,
        });
      } else {
        items.push({
          level: "error",
          message: `${label} (${x.toFixed(3)}, ${y.toFixed(3)}) is far outside the demonstrated area (x ${b.minX.toFixed(3)}…${b.maxX.toFixed(3)}, y ${b.minY.toFixed(3)}…${b.maxY.toFixed(3)}) — nothing about that region was verified on the real arm.`,
        });
      }
    }
  } else {
    items.push({ level: "warning", message: "No demonstrated bounds available — coordinate range cannot be checked." });
  }

  // 5. Orientation consistency (the plan reuses the confirmed orientation, so
  // the risk is a low-confidence inference).
  if (profile.toolOrientation.value !== null && profile.toolOrientation.confidence < 0.5) {
    items.push({
      level: "warning",
      message: "Tool orientation varied noticeably across the demonstration — the averaged orientation may not suit every point.",
    });
  }

  // 6. Gripper values.
  const open = input.gripperOpen;
  const close = input.gripperClose;
  if (!Number.isFinite(open) || open < 0 || open > 1) {
    items.push({ level: "error", message: `Gripper OPEN value must be between 0 and 1 (got ${open}).` });
  }
  if (!Number.isFinite(close) || close < 0 || close > 1) {
    items.push({ level: "error", message: `Gripper CLOSE value must be between 0 and 1 (got ${close}).` });
  }
  if (Number.isFinite(open) && Number.isFinite(close) && open >= close) {
    items.push({
      level: "warning",
      message: `Gripper OPEN (${open.toFixed(3)}) is not smaller than CLOSE (${close.toFixed(3)}) — on Kinova grippers 0 is fully open. Double-check.`,
    });
  }

  // 7. Plan completeness.
  if (plan === null) {
    items.push({ level: "error", message: "Trajectory could not be planned — confirm the required workspace parameters first." });
  } else {
    for (const step of plan) {
      if (step.segment !== "gripper" && !step.pose) {
        items.push({ level: "error", message: `Step ${step.type} is missing a target pose.` });
      }
      if (step.segment === "gripper" && !Number.isFinite(step.gripperValue)) {
        items.push({ level: "error", message: `Step ${step.type} is missing a gripper value.` });
      }
    }
  }

  if (items.length === 0) {
    items.push({ level: "ok", message: "All checks passed. Still: verify in Kortex before running on the real arm." });
  }
  return items;
}

export function hasBlockingErrors(items: ValidationItem[]): boolean {
  return items.some((item) => item.level === "error");
}
