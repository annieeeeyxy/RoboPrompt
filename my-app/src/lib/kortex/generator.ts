import type {
  KortexFile,
  KortexGripperAction,
  KortexPose,
  KortexReachPoseAction,
  KortexSequence,
  KortexTask,
  PickPlaceInput,
  PlannedStep,
  WorkspaceProfile,
} from "./types";

export const SLOW_SPEED_FACTOR = 0.5;

/**
 * Plan the standard 9-step pick-and-place. Pure geometry — no JSON yet — so
 * the UI can preview the exact trajectory before anything is generated.
 * Returns null when required profile values are missing or unconfirmed.
 */
export function planPickPlace(
  input: PickPlaceInput,
  profile: WorkspaceProfile
): PlannedStep[] | null {
  const table = confirmedValue(profile.estimatedTableHeight);
  const safe = confirmedValue(profile.safeTravelHeight);
  const orientation = confirmedValue(profile.toolOrientation);
  if (table === null || safe === null || orientation === null) return null;

  const pickZ = input.pickZ ?? table;
  const placeZ = input.placeZ ?? table;
  const pose = (x: number, y: number, z: number): KortexPose => ({
    x,
    y,
    z,
    thetaX: orientation.thetaX,
    thetaY: orientation.thetaY,
    thetaZ: orientation.thetaZ,
  });

  return [
    { type: "OPEN", segment: "gripper", gripperValue: input.gripperOpen },
    { type: "PICK_APPROACH", segment: "travel", pose: pose(input.pickX, input.pickY, safe) },
    { type: "PICK", segment: "descend", pose: pose(input.pickX, input.pickY, pickZ) },
    { type: "CLOSE", segment: "gripper", gripperValue: input.gripperClose },
    { type: "LIFT", segment: "carry", pose: pose(input.pickX, input.pickY, safe) },
    { type: "PLACE_APPROACH", segment: "carry", pose: pose(input.placeX, input.placeY, safe) },
    { type: "PLACE", segment: "descend", pose: pose(input.placeX, input.placeY, placeZ) },
    { type: "RELEASE", segment: "gripper", gripperValue: input.gripperOpen },
    { type: "RETREAT", segment: "retreat", pose: pose(input.placeX, input.placeY, safe) },
  ];
}

function confirmedValue<T>(param: { value: T | null; confirmedByUser: boolean }): T | null {
  return param.confirmedByUser ? param.value : null;
}

// ---------------------------------------------------------------------------

type Templates = {
  sequenceApplicationData: string;
  taskApplicationData: string;
  actionApplicationData: string;
  permission: number;
  reachPoseActionType: number;
  gripperActionType: number | null;
  /** Deep-cloned from a demonstrated reachPose — keeps constraint shape. */
  constraintTemplate: unknown;
  /** Deep-cloned from a demonstrated gripper command, or null if none. */
  gripperCommandTemplate: Record<string, unknown> | null;
  nextSequenceIdentifier: number;
  nextActionIdentifier: number;
};

/**
 * Everything structural in the generated file is cloned from the uploaded
 * demonstration — applicationData strings, permissions, actionType codes,
 * constraint and gripper-command shapes, identifier ranges — so the output
 * matches what the user's own Kortex installation exported. We never invent
 * fields. Returns an error when the demonstration lacks a piece we refuse
 * to fabricate (e.g. no gripper command anywhere in the file).
 */
export function extractTemplates(raw: KortexFile): Templates | { error: string } {
  const sequences = raw.sequences.sequence;
  let sequenceApplicationData = "";
  let taskApplicationData = "";
  let actionApplicationData = "";
  let permission = 7;
  let reachPoseActionType: number | null = null;
  let gripperActionType: number | null = null;
  let constraintTemplate: unknown = null;
  let gripperCommandTemplate: Record<string, unknown> | null = null;
  let maxSequenceId = 0;
  let maxActionId = 0;

  for (const seq of sequences) {
    if (typeof seq.applicationData === "string" && !sequenceApplicationData) {
      sequenceApplicationData = seq.applicationData;
    }
    if (typeof seq.handle?.identifier === "number") {
      maxSequenceId = Math.max(maxSequenceId, seq.handle.identifier);
      if (typeof seq.handle.permission === "number") permission = seq.handle.permission;
    }
    for (const task of seq.tasks ?? []) {
      if (typeof task.applicationData === "string" && !taskApplicationData) {
        taskApplicationData = task.applicationData;
      }
      const action = task.action as
        | (Partial<KortexReachPoseAction> & Partial<KortexGripperAction>)
        | undefined;
      if (!action) continue;
      if (typeof action.applicationData === "string" && !actionApplicationData) {
        actionApplicationData = action.applicationData;
      }
      if (typeof action.handle?.identifier === "number") {
        maxActionId = Math.max(maxActionId, action.handle.identifier);
      }
      if (action.reachPose) {
        if (typeof action.handle?.actionType === "number") reachPoseActionType = action.handle.actionType;
        if (action.reachPose.constraint && constraintTemplate === null) {
          constraintTemplate = structuredClone(action.reachPose.constraint);
        }
      }
      if (action.sendGripperCommand) {
        if (typeof action.handle?.actionType === "number") gripperActionType = action.handle.actionType;
        if (gripperCommandTemplate === null) {
          gripperCommandTemplate = structuredClone(
            action.sendGripperCommand
          ) as Record<string, unknown>;
        }
      }
    }
  }

  if (reachPoseActionType === null || constraintTemplate === null) {
    return {
      error:
        "The demonstration contains no reachPose action to use as a structural template — cannot generate compatible motion steps.",
    };
  }

  return {
    sequenceApplicationData,
    taskApplicationData,
    actionApplicationData,
    permission,
    reachPoseActionType,
    gripperActionType,
    constraintTemplate,
    gripperCommandTemplate,
    nextSequenceIdentifier: maxSequenceId + 1,
    nextActionIdentifier: maxActionId + 1,
  };
}

/**
 * Wrap a planned trajectory into a Kortex file with a single new sequence,
 * cloning all structure/metadata from the uploaded demonstration. The
 * returned file contains ONLY the new sequence, so importing it cannot
 * overwrite the user's existing ones.
 */
export function generateKortexFile(
  plan: PlannedStep[],
  input: PickPlaceInput,
  profile: WorkspaceProfile,
  raw: KortexFile
): KortexFile | { error: string } {
  const templates = extractTemplates(raw);
  if ("error" in templates) return templates;
  if (templates.gripperCommandTemplate === null || templates.gripperActionType === null) {
    return {
      error:
        "The demonstration contains no gripper command to use as a structural template — record one OPEN/CLOSE in Kortex and re-export.",
    };
  }

  const speed = profile.defaultSpeed.confirmedByUser ? profile.defaultSpeed.value : null;
  if (speed === null) {
    return { error: "Default speed has not been confirmed." };
  }
  const translation = input.speedLevel === "slow" ? speed * SLOW_SPEED_FACTOR : speed;

  let actionId = templates.nextActionIdentifier;
  const tasks: KortexTask[] = plan.map((step, index) => {
    const handle = { identifier: actionId++, permission: templates.permission };
    let action: Record<string, unknown>;
    if (step.segment === "gripper") {
      const command = structuredClone(templates.gripperCommandTemplate) as {
        gripper?: { finger?: { value: number }[] };
      };
      if (command.gripper?.finger?.[0]) {
        command.gripper.finger[0].value = step.gripperValue ?? 0;
      }
      action = {
        applicationData: templates.actionApplicationData,
        handle: { ...handle, actionType: templates.gripperActionType },
        sendGripperCommand: command,
        name: step.type,
      };
    } else {
      const constraint = structuredClone(templates.constraintTemplate) as {
        speed?: { translation?: number };
      };
      if (constraint.speed) constraint.speed.translation = translation;
      action = {
        reachPose: { targetPose: step.pose, constraint },
        applicationData: templates.actionApplicationData,
        handle: { ...handle, actionType: templates.reachPoseActionType },
        name: step.type,
      };
    }
    return {
      applicationData: templates.taskApplicationData,
      action,
      groupIdentifier: index,
    };
  });

  const sequence: KortexSequence = {
    applicationData: templates.sequenceApplicationData,
    handle: { identifier: templates.nextSequenceIdentifier, permission: templates.permission },
    name: sanitizeSequenceName(input.taskName),
    tasks,
  };

  return { sequences: { sequence: [sequence] } };
}

function sanitizeSequenceName(name: string): string {
  const cleaned = name.trim().replace(/[^\w\s-]/g, "").slice(0, 60);
  return cleaned || "RoboPrompt_pick_and_place";
}
