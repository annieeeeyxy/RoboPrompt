import type { PlannedStep, ValidationItem } from "@/lib/kortex/types";

// ---------------------------------------------------------------------------
// Vision

export type DetectedObject = {
  /** Numbered display label, e.g. "Apple 2" when duplicates exist. */
  id: string;
  label: string;
  confidence: number;
  /** Normalized 0–1 box relative to the analyzed frame; approximate. */
  box: { x: number; y: number; w: number; h: number } | null;
};

export type CameraSource = "webcam" | "uploaded-image" | "none";

/** Where a robot coordinate came from — shown next to every coordinate. */
export type CoordinateSource =
  | "depth-camera"
  | "camera-calibration"
  | "manual"
  | "estimated-needs-confirmation";

export const COORDINATE_SOURCE_LABELS: Record<CoordinateSource, string> = {
  "depth-camera": "Depth Camera",
  "camera-calibration": "Camera Calibration",
  manual: "Manually Entered",
  "estimated-needs-confirmation": "Estimated — Needs Confirmation",
};

// ---------------------------------------------------------------------------
// Language command

export type StructuredCommand = {
  action: "pick_and_place" | "pick" | "unsupported";
  object: string | null;
  destination: string | null;
  /** Model-suggested follow-up question when something is missing/unclear. */
  clarification: string | null;
};

/** Result of resolving a structured command against the current detections. */
export type CommandResolution =
  | { status: "ready"; object: DetectedObject; destinationLabel: string }
  | { status: "choose-object"; candidates: DetectedObject[]; destinationLabel: string | null }
  | { status: "ask"; question: string }
  | { status: "not-found"; message: string };

// ---------------------------------------------------------------------------
// Robot bridge / execution

export type RobotState = {
  online: boolean;
  currentAction: string | null;
  /** 0–1 while executing. */
  progress: number | null;
  status: "idle" | "executing" | "paused" | "completed" | "error" | "unknown";
  error: string | null;
};

export type MotionPlan = {
  taskName: string;
  objectName: string;
  steps: PlannedStep[];
  speedLevel: "slow" | "normal";
  /** The generated Kortex sequence file, for bridges that speak Kortex. */
  kortexSequence: unknown;
};

export type ValidationResult = { items: ValidationItem[]; ok: boolean };

/**
 * Adapter seam for real robot backends (local Python bridge today; Kortex
 * Python API or ROS 2 adapters later). The web app only ever talks to an
 * adapter — never to the arm directly.
 */
export interface RobotAdapter {
  connect(): Promise<void>;
  getState(): Promise<RobotState>;
  preview(plan: MotionPlan): Promise<ValidationResult>;
  execute(plan: MotionPlan): Promise<void>;
  pause(): Promise<void>;
  stop(): Promise<void>;
}

// ---------------------------------------------------------------------------
// Policy seam (future VLA)

export type CameraFrame = { base64Jpeg: string };

export type RobotAction = PlannedStep;

/**
 * Interface a future SmolVLA/OpenVLA adapter would implement. The current
 * implementation is TemplatePolicyAdapter — a verified-skill template, NOT a
 * trained VLA model, and the UI must say so ("Control Mode: Verified Skill
 * Template").
 */
export interface PolicyAdapter {
  readonly controlModeLabel: string;
  predict(input: {
    images: CameraFrame[];
    instruction: string;
    robotState: RobotState;
  }): Promise<RobotAction[]>;
}
