import type {
  KortexFile,
  KortexPose,
  ParsedDemo,
  ParsedSequence,
  ParsedStep,
} from "./types";

function isFiniteNumber(v: unknown): v is number {
  return typeof v === "number" && Number.isFinite(v);
}

function asPose(v: unknown): KortexPose | null {
  if (typeof v !== "object" || v === null) return null;
  const p = v as Record<string, unknown>;
  const keys = ["x", "y", "z", "thetaX", "thetaY", "thetaZ"] as const;
  for (const key of keys) {
    if (!isFiniteNumber(p[key])) return null;
  }
  return {
    x: p.x as number,
    y: p.y as number,
    z: p.z as number,
    thetaX: p.thetaX as number,
    thetaY: p.thetaY as number,
    thetaZ: p.thetaZ as number,
  };
}

/**
 * Parse a Kortex sequence export. Tolerant by design: unknown action kinds
 * become `kind: "other"` and malformed entries are reported in `warnings`
 * instead of failing the whole file. The raw parsed JSON is preserved
 * untouched on the result for the generator to clone structure from.
 */
export function parseKortexFile(text: string): ParsedDemo | { error: string } {
  let raw: unknown;
  try {
    raw = JSON.parse(text);
  } catch {
    return { error: "This file is not valid JSON." };
  }

  const sequenceList = (raw as KortexFile)?.sequences?.sequence;
  if (!Array.isArray(sequenceList)) {
    return {
      error:
        "No sequences found — expected a Kortex export with the shape { sequences: { sequence: [...] } }.",
    };
  }

  const warnings: string[] = [];
  const sequences: ParsedSequence[] = [];

  for (const seq of sequenceList) {
    if (typeof seq !== "object" || seq === null) {
      warnings.push("Skipped a sequence entry that is not an object.");
      continue;
    }
    const name = typeof seq.name === "string" ? seq.name : "(unnamed sequence)";
    const identifier = isFiniteNumber(seq.handle?.identifier) ? seq.handle.identifier : null;
    const steps: ParsedStep[] = [];

    const tasks = Array.isArray(seq.tasks) ? seq.tasks : [];
    tasks.forEach((task, index) => {
      const action = task?.action as Record<string, unknown> | undefined;
      if (!action) {
        steps.push({ kind: "other", name: "(missing action)", index });
        return;
      }
      const actionName = typeof action.name === "string" ? action.name : `(step ${index + 1})`;
      const handle = action.handle as { identifier?: unknown; actionType?: unknown } | undefined;
      const handleIdentifier = isFiniteNumber(handle?.identifier) ? handle.identifier : null;
      const actionType = isFiniteNumber(handle?.actionType) ? handle.actionType : null;

      const reachPose = action.reachPose as
        | { targetPose?: unknown; constraint?: { speed?: { translation?: unknown } } }
        | undefined;
      if (reachPose) {
        const pose = asPose(reachPose.targetPose);
        if (!pose) {
          warnings.push(`"${name}" step "${actionName}": reachPose without a complete targetPose — skipped.`);
          steps.push({ kind: "other", name: actionName, index });
          return;
        }
        const translation = reachPose.constraint?.speed?.translation;
        steps.push({
          kind: "pose",
          name: actionName,
          pose,
          speedTranslation: isFiniteNumber(translation) ? translation : null,
          handleIdentifier,
          actionType,
          index,
        });
        return;
      }

      const gripperCommand = action.sendGripperCommand as
        | { gripper?: { finger?: { value?: unknown }[] } }
        | undefined;
      if (gripperCommand) {
        const value = gripperCommand.gripper?.finger?.[0]?.value;
        if (!isFiniteNumber(value)) {
          warnings.push(`"${name}" step "${actionName}": gripper command without a finger value — skipped.`);
          steps.push({ kind: "other", name: actionName, index });
          return;
        }
        steps.push({ kind: "gripper", name: actionName, value, handleIdentifier, actionType, index });
        return;
      }

      steps.push({ kind: "other", name: actionName, index });
    });

    sequences.push({
      name,
      identifier,
      steps,
      poseCount: steps.filter((s) => s.kind === "pose").length,
      gripperCount: steps.filter((s) => s.kind === "gripper").length,
    });
  }

  if (sequences.length === 0) {
    return { error: "The file contains no readable sequences." };
  }

  return {
    sequences,
    bestSequenceIndex: pickBestSequence(sequences),
    warnings,
    raw: raw as KortexFile,
  };
}

/**
 * A useful demonstration has both motion and gripper activity. Prefer the
 * sequence with gripper commands and the most poses; PICK/PLACE-style names
 * break ties.
 */
function pickBestSequence(sequences: ParsedSequence[]): number | null {
  let best: number | null = null;
  let bestScore = -1;
  sequences.forEach((seq, i) => {
    if (seq.poseCount < 2) return;
    const named = seq.steps.filter((s) => /pick|place|open|close/i.test(s.name)).length;
    const score = seq.poseCount + seq.gripperCount * 3 + named;
    if (score > bestScore) {
      bestScore = score;
      best = i;
    }
  });
  return best;
}
