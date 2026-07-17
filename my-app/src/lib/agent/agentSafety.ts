import { validatePlan } from "@/lib/kortex/validation";
import type {
  PickPlaceInput,
  PlannedStep,
  ValidationItem,
  WorkspaceProfile,
} from "@/lib/kortex/types";
import type { CameraSource, CoordinateSource } from "./types";

export type ExecutionContext = {
  bridgeOnline: boolean;
  cameraSource: CameraSource;
  demoMode: boolean;
  pickSource: CoordinateSource;
  placeSource: CoordinateSource;
  coordinatesConfirmed: boolean;
};

/**
 * Full pre-execution safety check: the geometric/workspace checks from the
 * Kortex validator plus the execution-context checks (bridge, camera, demo
 * mode, coordinate provenance). Any `error` item must disable Confirm & Run.
 */
export function validateExecution(
  input: PickPlaceInput,
  profile: WorkspaceProfile,
  plan: PlannedStep[] | null,
  ctx: ExecutionContext
): ValidationItem[] {
  const items = validatePlan(input, profile, plan).filter((i) => i.level !== "ok");

  if (ctx.demoMode) {
    items.push({
      level: "error",
      message: "Demo Mode — Robot execution is disabled. Connect a real camera to execute.",
    });
  }
  if (!ctx.bridgeOnline) {
    items.push({
      level: "error",
      message: "Robot Bridge is offline — preview works, execution is disabled.",
    });
  }
  if (ctx.cameraSource === "none") {
    items.push({
      level: "warning",
      message: "No camera connected — you are planning blind against manually entered coordinates.",
    });
  }

  for (const [label, source] of [
    ["Pick", ctx.pickSource],
    ["Place", ctx.placeSource],
  ] as const) {
    if (source === "estimated-needs-confirmation") {
      items.push({
        level: "error",
        message: `${label} coordinates are estimated and unconfirmed — enter them manually, teach them in Kortex, or calibrate the camera.`,
      });
    }
  }
  if (!ctx.coordinatesConfirmed) {
    items.push({
      level: "error",
      message: "Pick/Place coordinates have not been confirmed by the user.",
    });
  }

  if (items.length === 0) {
    items.push({
      level: "ok",
      message:
        "All checks passed. Run at low speed, keep the workspace clear, and keep the emergency stop accessible.",
    });
  }
  return items;
}
