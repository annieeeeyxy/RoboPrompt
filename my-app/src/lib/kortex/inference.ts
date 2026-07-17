import type { InferredParam, ParsedSequence, WorkspaceProfile } from "./types";

const CONTACT_NAME = /pick|place|descend|contact|grasp/i;
const OPEN_NAME = /open|release/i;
const CLOSE_NAME = /close|grip|grasp/i;

function unavailable<T>(reason: string): InferredParam<T> {
  return { value: null, sourceAction: "—", reason, confidence: 0, confirmedByUser: false };
}

/** Circular mean so angles near ±180° don't average to nonsense. */
function circularMeanDeg(values: number[]): number {
  const rad = values.map((v) => (v * Math.PI) / 180);
  const y = rad.reduce((s, r) => s + Math.sin(r), 0);
  const x = rad.reduce((s, r) => s + Math.cos(r), 0);
  return (Math.atan2(y, x) * 180) / Math.PI;
}

function angularSpreadDeg(values: number[]): number {
  const mean = circularMeanDeg(values);
  return Math.max(
    ...values.map((v) => {
      let d = Math.abs(v - mean) % 360;
      if (d > 180) d = 360 - d;
      return d;
    })
  );
}

/**
 * Derive a workspace profile from one demonstrated sequence. Every value
 * carries its source action, the reasoning, and a confidence score, and
 * starts unconfirmed — the UI requires explicit user confirmation before
 * anything is used for generation.
 */
export function inferWorkspaceProfile(sequence: ParsedSequence): WorkspaceProfile {
  const poses = sequence.steps.filter((s) => s.kind === "pose");
  const grippers = sequence.steps.filter((s) => s.kind === "gripper");

  // --- Table height -------------------------------------------------------
  // Prefer poses whose names say they touch the workpiece (PICK/PLACE/...).
  // Only fall back to "recurring lowest height" when no names match, and say
  // so in the reason. Never blindly take the global minimum Z.
  let tableHeight: InferredParam<number>;
  const contactPoses = poses.filter((p) => CONTACT_NAME.test(p.name));
  const contactCluster = contactPoses.filter(
    (p) => p.pose.z <= Math.min(...contactPoses.map((c) => c.pose.z)) + 0.015
  );
  if (contactCluster.length >= 2) {
    const mean = contactCluster.reduce((s, p) => s + p.pose.z, 0) / contactCluster.length;
    tableHeight = {
      value: mean,
      sourceAction: contactCluster.map((p) => p.name).join(", "),
      reason: `PICK/PLACE-named poses converge at z ≈ ${mean.toFixed(4)} m (spread < 15 mm). Estimated from demonstration — not measured.`,
      confidence: 0.8,
      confirmedByUser: false,
    };
  } else if (contactCluster.length === 1) {
    tableHeight = {
      value: contactCluster[0].pose.z,
      sourceAction: contactCluster[0].name,
      reason:
        "Only one contact-named pose found — single sample, please verify. Estimated from demonstration — not measured.",
      confidence: 0.5,
      confirmedByUser: false,
    };
  } else {
    const zs = poses.map((p) => p.pose.z).sort((a, b) => a - b);
    const lowCluster = zs.filter((z) => z <= zs[0] + 0.015);
    if (lowCluster.length >= 2) {
      const mean = lowCluster.reduce((s, z) => s + z, 0) / lowCluster.length;
      tableHeight = {
        value: mean,
        sourceAction: "(unnamed poses)",
        reason:
          "No PICK/PLACE-named poses — used the lowest recurring height in the demonstration. Low confidence, please verify against your setup.",
        confidence: 0.4,
        confirmedByUser: false,
      };
    } else {
      tableHeight = unavailable(
        "Could not identify a contact height from action names or recurring low poses — enter it manually."
      );
    }
  }

  // --- Safe travel height -------------------------------------------------
  let safeTravel: InferredParam<number>;
  if (poses.length > 0) {
    const highest = poses.reduce((a, b) => (a.pose.z >= b.pose.z ? a : b));
    safeTravel = {
      value: highest.pose.z,
      sourceAction: highest.name,
      reason: `Highest pose in the demonstration (z = ${highest.pose.z.toFixed(4)} m) — the arm traveled safely at this height.`,
      confidence: 0.7,
      confirmedByUser: false,
    };
  } else {
    safeTravel = unavailable("No poses in the demonstration.");
  }

  // --- Tool orientation ----------------------------------------------------
  let toolOrientation: InferredParam<{ thetaX: number; thetaY: number; thetaZ: number }>;
  if (poses.length > 0) {
    const spread = Math.max(
      angularSpreadDeg(poses.map((p) => p.pose.thetaX)),
      angularSpreadDeg(poses.map((p) => p.pose.thetaY)),
      angularSpreadDeg(poses.map((p) => p.pose.thetaZ))
    );
    const mean = {
      thetaX: circularMeanDeg(poses.map((p) => p.pose.thetaX)),
      thetaY: circularMeanDeg(poses.map((p) => p.pose.thetaY)),
      thetaZ: circularMeanDeg(poses.map((p) => p.pose.thetaZ)),
    };
    toolOrientation =
      spread < 15
        ? {
            value: mean,
            sourceAction: "all demonstrated poses",
            reason: `Tool orientation is consistent across the demonstration (max deviation ${spread.toFixed(1)}°).`,
            confidence: 0.85,
            confirmedByUser: false,
          }
        : {
            value: mean,
            sourceAction: "all demonstrated poses",
            reason: `Orientation varies by up to ${spread.toFixed(1)}° across the demonstration — the mean may not suit every point. Verify carefully.`,
            confidence: 0.3,
            confirmedByUser: false,
          };
  } else {
    toolOrientation = unavailable("No poses in the demonstration.");
  }

  // --- Gripper values ------------------------------------------------------
  const openCommands = grippers.filter((g) => OPEN_NAME.test(g.name));
  const closeCommands = grippers.filter((g) => CLOSE_NAME.test(g.name) && !OPEN_NAME.test(g.name));
  let gripperOpen: InferredParam<number>;
  let gripperClose: InferredParam<number>;
  if (openCommands.length > 0) {
    gripperOpen = {
      value: openCommands[0].value,
      sourceAction: openCommands.map((g) => g.name).join(", "),
      reason: "Finger value of the OPEN-named gripper command in the demonstration.",
      confidence: 0.85,
      confirmedByUser: false,
    };
  } else if (grippers.length >= 2) {
    const min = grippers.reduce((a, b) => (a.value <= b.value ? a : b));
    gripperOpen = {
      value: min.value,
      sourceAction: min.name,
      reason: "No OPEN-named command — used the smallest demonstrated finger value (0 = fully open on Kinova grippers).",
      confidence: 0.5,
      confirmedByUser: false,
    };
  } else {
    gripperOpen = unavailable("No gripper commands in the demonstration — enter the open value manually.");
  }
  if (closeCommands.length > 0) {
    gripperClose = {
      value: closeCommands[0].value,
      sourceAction: closeCommands.map((g) => g.name).join(", "),
      reason: "Finger value of the CLOSE-named gripper command in the demonstration.",
      confidence: 0.85,
      confirmedByUser: false,
    };
  } else if (grippers.length >= 2) {
    const max = grippers.reduce((a, b) => (a.value >= b.value ? a : b));
    gripperClose = {
      value: max.value,
      sourceAction: max.name,
      reason: "No CLOSE-named command — used the largest demonstrated finger value.",
      confidence: 0.5,
      confirmedByUser: false,
    };
  } else {
    gripperClose = unavailable("No gripper commands in the demonstration — enter the close value manually.");
  }

  // --- Speed ---------------------------------------------------------------
  const speeds = poses
    .map((p) => p.speedTranslation)
    .filter((s): s is number => s !== null && s > 0);
  const defaultSpeed: InferredParam<number> =
    speeds.length > 0
      ? {
          value: speeds.sort((a, b) => a - b)[Math.floor(speeds.length / 2)],
          sourceAction: "demonstrated reachPose constraints",
          reason: `Median translation speed across ${speeds.length} demonstrated moves.`,
          confidence: 0.9,
          confirmedByUser: false,
        }
      : unavailable("No speed constraints found in the demonstration.");

  // --- Bounds ---------------------------------------------------------------
  const bounds =
    poses.length > 0
      ? {
          minX: Math.min(...poses.map((p) => p.pose.x)),
          maxX: Math.max(...poses.map((p) => p.pose.x)),
          minY: Math.min(...poses.map((p) => p.pose.y)),
          maxY: Math.max(...poses.map((p) => p.pose.y)),
          minZ: Math.min(...poses.map((p) => p.pose.z)),
          maxZ: Math.max(...poses.map((p) => p.pose.z)),
        }
      : null;

  return {
    estimatedTableHeight: tableHeight,
    safeTravelHeight: safeTravel,
    toolOrientation,
    gripperOpenValue: gripperOpen,
    gripperCloseValue: gripperClose,
    defaultSpeed,
    bounds,
    sourceSequenceName: sequence.name,
  };
}
