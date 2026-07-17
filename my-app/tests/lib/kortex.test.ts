import { describe, expect, it } from "vitest";
import { parseKortexFile } from "../../src/lib/kortex/parser";
import { inferWorkspaceProfile } from "../../src/lib/kortex/inference";
import {
  extractTemplates,
  generateKortexFile,
  planPickPlace,
  SLOW_SPEED_FACTOR,
} from "../../src/lib/kortex/generator";
import { hasBlockingErrors, validatePlan } from "../../src/lib/kortex/validation";
import { SAMPLE_KORTEX_FILE } from "../../src/lib/kortex/sample";
import type {
  KortexReachPoseAction,
  KortexGripperAction,
  ParsedDemo,
  PickPlaceInput,
  WorkspaceProfile,
} from "../../src/lib/kortex/types";

const sampleText = JSON.stringify(SAMPLE_KORTEX_FILE);

function parsedSample(): ParsedDemo {
  const result = parseKortexFile(sampleText);
  if ("error" in result) throw new Error(result.error);
  return result;
}

function confirmedProfile(): WorkspaceProfile {
  const demo = parsedSample();
  const profile = inferWorkspaceProfile(demo.sequences[demo.bestSequenceIndex!]);
  for (const key of [
    "estimatedTableHeight",
    "safeTravelHeight",
    "toolOrientation",
    "gripperOpenValue",
    "gripperCloseValue",
    "defaultSpeed",
  ] as const) {
    profile[key] = { ...profile[key], confirmedByUser: true } as never;
  }
  return profile;
}

function sampleInput(overrides: Partial<PickPlaceInput> = {}): PickPlaceInput {
  return {
    taskName: "test_task",
    objectName: "bolt",
    pickX: 0.45,
    pickY: -0.05,
    placeX: 0.5,
    placeY: 0.15,
    pickZ: null,
    placeZ: null,
    speedLevel: "normal",
    gripperOpen: 0.01,
    gripperClose: 0.55,
    ...overrides,
  };
}

describe("parseKortexFile", () => {
  it("rejects non-JSON and non-Kortex shapes", () => {
    expect(parseKortexFile("not json")).toHaveProperty("error");
    expect(parseKortexFile('{"foo": 1}')).toHaveProperty("error");
  });

  it("parses sequences, poses, and gripper commands from the mock", () => {
    const demo = parsedSample();
    expect(demo.sequences).toHaveLength(1);
    const seq = demo.sequences[0];
    expect(seq.poseCount).toBe(5);
    expect(seq.gripperCount).toBe(3);
    const pick = seq.steps.find((s) => s.name === "PICK_LOW");
    expect(pick?.kind).toBe("pose");
    if (pick?.kind === "pose") {
      expect(pick.pose.z).toBeCloseTo(0.031, 5);
      expect(pick.speedTranslation).toBeCloseTo(0.25, 5);
    }
  });

  it("tolerates malformed tasks with warnings instead of failing", () => {
    const mangled = structuredClone(SAMPLE_KORTEX_FILE);
    // strip targetPose from one task
    const action = mangled.sequences.sequence[0].tasks![1].action as {
      reachPose: { targetPose?: unknown };
    };
    delete action.reachPose.targetPose;
    const result = parseKortexFile(JSON.stringify(mangled));
    if ("error" in result) throw new Error("should not hard-fail");
    expect(result.warnings.length).toBeGreaterThan(0);
    expect(result.sequences[0].poseCount).toBe(4);
  });
});

describe("inferWorkspaceProfile", () => {
  it("derives table height from PICK/PLACE-named poses, not the global minimum", () => {
    const demo = parsedSample();
    const profile = inferWorkspaceProfile(demo.sequences[0]);
    // PICK_LOW z=0.031, PLACE_LOW z=0.029 → mean 0.03
    expect(profile.estimatedTableHeight.value).toBeCloseTo(0.03, 3);
    expect(profile.estimatedTableHeight.sourceAction).toContain("PICK_LOW");
    expect(profile.estimatedTableHeight.confirmedByUser).toBe(false);
    expect(profile.estimatedTableHeight.reason).toContain("Estimated from demonstration");
  });

  it("derives travel height, orientation, gripper values, and speed with provenance", () => {
    const demo = parsedSample();
    const profile = inferWorkspaceProfile(demo.sequences[0]);
    expect(profile.safeTravelHeight.value).toBeCloseTo(0.24, 5);
    expect(profile.safeTravelHeight.sourceAction).toBe("TRAVEL_B");
    expect(profile.gripperOpenValue.value).toBeCloseTo(0.01, 5);
    expect(profile.gripperCloseValue.value).toBeCloseTo(0.55, 5);
    expect(profile.defaultSpeed.value).toBeCloseTo(0.25, 5);
    expect(profile.toolOrientation.value?.thetaX).toBeCloseTo(178.2, 0);
    expect(profile.toolOrientation.confidence).toBeGreaterThan(0.5);
    expect(profile.bounds?.minZ).toBeCloseTo(0.029, 5);
  });
});

describe("planPickPlace", () => {
  it("returns null until required params are confirmed", () => {
    const demo = parsedSample();
    const unconfirmed = inferWorkspaceProfile(demo.sequences[0]);
    expect(planPickPlace(sampleInput(), unconfirmed)).toBeNull();
  });

  it("plans the standard 9 steps with confirmed heights", () => {
    const plan = planPickPlace(sampleInput(), confirmedProfile());
    expect(plan).not.toBeNull();
    expect(plan!.map((s) => s.type)).toEqual([
      "OPEN",
      "PICK_APPROACH",
      "PICK",
      "CLOSE",
      "LIFT",
      "PLACE_APPROACH",
      "PLACE",
      "RELEASE",
      "RETREAT",
    ]);
    const pick = plan!.find((s) => s.type === "PICK")!;
    expect(pick.pose!.z).toBeCloseTo(0.03, 3); // confirmed table height
    const lift = plan!.find((s) => s.type === "LIFT")!;
    expect(lift.pose!.z).toBeCloseTo(0.24, 5); // confirmed safe height
  });
});

describe("validatePlan", () => {
  it("blocks when params are unconfirmed", () => {
    const demo = parsedSample();
    const profile = inferWorkspaceProfile(demo.sequences[0]);
    const items = validatePlan(sampleInput(), profile, null);
    expect(hasBlockingErrors(items)).toBe(true);
  });

  it("errors when pick Z is below the confirmed table height", () => {
    const profile = confirmedProfile();
    const input = sampleInput({ pickZ: 0.0 });
    const items = validatePlan(input, profile, planPickPlace(input, profile));
    expect(items.some((i) => i.level === "error" && i.message.includes("below the confirmed table height"))).toBe(true);
  });

  it("warns near the demonstrated range and errors far outside it", () => {
    const profile = confirmedProfile();
    const near = sampleInput({ pickX: 0.61 }); // demo maxX 0.55, +0.06 → warning band
    const nearItems = validatePlan(near, profile, planPickPlace(near, profile));
    expect(nearItems.some((i) => i.level === "warning" && i.message.includes("outside the demonstrated area"))).toBe(true);

    const far = sampleInput({ pickX: 1.2 });
    const farItems = validatePlan(far, profile, planPickPlace(far, profile));
    expect(farItems.some((i) => i.level === "error" && i.message.includes("far outside the demonstrated area"))).toBe(true);
  });

  it("passes a clean in-range task", () => {
    const profile = confirmedProfile();
    const input = sampleInput();
    const items = validatePlan(input, profile, planPickPlace(input, profile));
    expect(hasBlockingErrors(items)).toBe(false);
  });
});

describe("generateKortexFile", () => {
  it("clones structure and metadata from the uploaded file", () => {
    const demo = parsedSample();
    const profile = confirmedProfile();
    const input = sampleInput();
    const plan = planPickPlace(input, profile)!;
    const file = generateKortexFile(plan, input, profile, demo.raw);
    if ("error" in file) throw new Error(file.error);

    expect(file.sequences.sequence).toHaveLength(1);
    const seq = file.sequences.sequence[0];
    expect(seq.name).toBe("test_task");
    expect(seq.applicationData).toBe('{"kinova":{"color":0}}');
    expect(seq.handle?.identifier).toBe(20001); // max sequence id + 1
    expect(seq.handle?.permission).toBe(7);

    const tasks = seq.tasks!;
    expect(tasks).toHaveLength(9);
    expect(tasks.map((t) => t.groupIdentifier)).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8]);

    // Action identifiers are new and unique (no collision with the source's).
    const ids = tasks.map((t) => (t.action as KortexReachPoseAction).handle!.identifier);
    expect(new Set(ids).size).toBe(9);
    expect(Math.min(...ids)).toBeGreaterThan(20067);

    // reachPose tasks keep the demonstrated constraint shape and actionType.
    const approach = tasks[1].action as KortexReachPoseAction;
    expect(approach.handle!.actionType).toBe(6);
    expect(approach.reachPose.constraint).toEqual({ speed: { translation: 0.25, orientation: 0 } });

    // Gripper tasks clone mode/duration/finger structure and swap the value.
    const open = tasks[0].action as KortexGripperAction;
    expect(open.handle!.actionType).toBe(33);
    expect(open.sendGripperCommand.mode).toBe(3);
    expect(open.sendGripperCommand.duration).toBe(0);
    expect(open.sendGripperCommand.gripper!.finger![0].value).toBeCloseTo(0.01, 5);
    expect(open.sendGripperCommand.gripper!.finger![0].fingerIdentifier).toBe(1);
  });

  it("halves the speed at the slow level", () => {
    const demo = parsedSample();
    const profile = confirmedProfile();
    const input = sampleInput({ speedLevel: "slow" });
    const plan = planPickPlace(input, profile)!;
    const file = generateKortexFile(plan, input, profile, demo.raw);
    if ("error" in file) throw new Error(file.error);
    const approach = file.sequences.sequence[0].tasks![1].action as KortexReachPoseAction;
    expect(approach.reachPose.constraint).toMatchObject({
      speed: { translation: 0.25 * SLOW_SPEED_FACTOR },
    });
  });

  it("refuses to fabricate a gripper command when the source has none", () => {
    const noGripper = structuredClone(SAMPLE_KORTEX_FILE);
    noGripper.sequences.sequence[0].tasks = noGripper.sequences.sequence[0].tasks!.filter(
      (t) => !(t.action as Record<string, unknown>).sendGripperCommand
    );
    const demoResult = parseKortexFile(JSON.stringify(noGripper));
    if ("error" in demoResult) throw new Error(demoResult.error);
    const profile = confirmedProfile();
    const input = sampleInput();
    const plan = planPickPlace(input, profile)!;
    const file = generateKortexFile(plan, input, profile, demoResult.raw);
    expect(file).toHaveProperty("error");
  });

  it("extractTemplates reports missing reachPose templates", () => {
    const empty = { sequences: { sequence: [{ name: "x", tasks: [] }] } };
    expect(extractTemplates(empty)).toHaveProperty("error");
  });
});
