// Types mirroring the Kortex sequence-export schema as observed in real
// files exported from a Kinova arm's web app. Field names and nesting are
// copied from observation, NOT invented — see parser.ts for how unknown
// shapes are tolerated instead of assumed.

export type KortexPose = {
  x: number;
  y: number;
  z: number;
  thetaX: number;
  thetaY: number;
  thetaZ: number;
};

export type KortexSpeedConstraint = {
  speed?: { translation?: number; orientation?: number };
};

export type KortexHandle = {
  identifier: number;
  permission?: number;
  actionType?: number;
};

export type KortexReachPoseAction = {
  reachPose: {
    targetPose: KortexPose;
    constraint?: KortexSpeedConstraint;
  };
  applicationData?: string;
  handle?: KortexHandle;
  name?: string;
};

export type KortexGripperAction = {
  sendGripperCommand: {
    mode?: number;
    gripper?: { finger?: { value: number; fingerIdentifier?: number }[] };
    duration?: number;
  };
  applicationData?: string;
  handle?: KortexHandle;
  name?: string;
};

export type KortexTask = {
  applicationData?: string;
  action?: Record<string, unknown>;
  groupIdentifier?: number;
};

export type KortexSequence = {
  applicationData?: string;
  handle?: KortexHandle;
  name?: string;
  tasks?: KortexTask[];
};

export type KortexFile = {
  sequences: { sequence: KortexSequence[] };
};

// ---------------------------------------------------------------------------
// Parsed (normalized) representation used by the UI and inference.

export type ParsedStep =
  | {
      kind: "pose";
      name: string;
      pose: KortexPose;
      speedTranslation: number | null;
      handleIdentifier: number | null;
      actionType: number | null;
      index: number;
    }
  | {
      kind: "gripper";
      name: string;
      value: number;
      handleIdentifier: number | null;
      actionType: number | null;
      index: number;
    }
  | { kind: "other"; name: string; index: number };

export type ParsedSequence = {
  name: string;
  identifier: number | null;
  steps: ParsedStep[];
  poseCount: number;
  gripperCount: number;
};

export type ParsedDemo = {
  sequences: ParsedSequence[];
  /** Index into `sequences` of the richest demonstration (poses + gripper). */
  bestSequenceIndex: number | null;
  warnings: string[];
  /** The original file, untouched — the generator clones structure from it. */
  raw: KortexFile;
};

// ---------------------------------------------------------------------------
// Workspace profile: every inferred value carries provenance + confidence and
// is unusable until the user confirms it.

export type InferredParam<T> = {
  value: T | null;
  sourceAction: string;
  reason: string;
  /** 0..1 */
  confidence: number;
  confirmedByUser: boolean;
};

export type WorkspaceProfile = {
  estimatedTableHeight: InferredParam<number>;
  safeTravelHeight: InferredParam<number>;
  toolOrientation: InferredParam<{ thetaX: number; thetaY: number; thetaZ: number }>;
  gripperOpenValue: InferredParam<number>;
  gripperCloseValue: InferredParam<number>;
  defaultSpeed: InferredParam<number>;
  /** Demonstrated workspace bounds, for range checks. */
  bounds: { minX: number; maxX: number; minY: number; maxY: number; minZ: number; maxZ: number } | null;
  sourceSequenceName: string;
};

// ---------------------------------------------------------------------------
// Task planning & generation.

export type PickPlaceInput = {
  taskName: string;
  objectName: string;
  pickX: number;
  pickY: number;
  placeX: number;
  placeY: number;
  /** Optional overrides; default to the confirmed table height. */
  pickZ: number | null;
  placeZ: number | null;
  speedLevel: "slow" | "normal";
  gripperOpen: number;
  gripperClose: number;
};

export type PlannedStepType =
  | "OPEN"
  | "PICK_APPROACH"
  | "PICK"
  | "CLOSE"
  | "LIFT"
  | "PLACE_APPROACH"
  | "PLACE"
  | "RELEASE"
  | "RETREAT";

export type PlannedStep = {
  type: PlannedStepType;
  /** "travel" = empty move, "carry" = holding the object. */
  segment: "gripper" | "travel" | "descend" | "carry" | "retreat";
  pose?: KortexPose;
  gripperValue?: number;
};

export type ValidationLevel = "ok" | "warning" | "error";

export type ValidationItem = {
  level: ValidationLevel;
  message: string;
};
