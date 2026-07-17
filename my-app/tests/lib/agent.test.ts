import { describe, expect, it } from "vitest";
import { labelMatches, numberDuplicates, resolveCommand } from "../../src/lib/agent/commandResolver";
import { validateExecution, type ExecutionContext } from "../../src/lib/agent/agentSafety";
import { createTemplatePolicyAdapter } from "../../src/lib/agent/templatePolicyAdapter";
import { hasBlockingErrors } from "../../src/lib/kortex/validation";
import { parseKortexFile } from "../../src/lib/kortex/parser";
import { inferWorkspaceProfile } from "../../src/lib/kortex/inference";
import { SAMPLE_KORTEX_FILE } from "../../src/lib/kortex/sample";
import type { DetectedObject, StructuredCommand } from "../../src/lib/agent/types";
import type { PickPlaceInput, WorkspaceProfile } from "../../src/lib/kortex/types";

function det(label: string, id = label): DetectedObject {
  return { id, label, confidence: 0.9, box: { x: 0.1, y: 0.1, w: 0.2, h: 0.2 } };
}

function command(overrides: Partial<StructuredCommand>): StructuredCommand {
  return { action: "pick_and_place", object: "apple", destination: "blue box", clarification: null, ...overrides };
}

function confirmedProfile(): WorkspaceProfile {
  const demo = parseKortexFile(JSON.stringify(SAMPLE_KORTEX_FILE));
  if ("error" in demo) throw new Error(demo.error);
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

function input(overrides: Partial<PickPlaceInput> = {}): PickPlaceInput {
  return {
    taskName: "agent_apple",
    objectName: "Apple 1",
    pickX: 0.45,
    pickY: -0.05,
    placeX: 0.5,
    placeY: 0.15,
    pickZ: null,
    placeZ: null,
    speedLevel: "slow",
    gripperOpen: 0.01,
    gripperClose: 0.55,
    ...overrides,
  };
}

function ctx(overrides: Partial<ExecutionContext> = {}): ExecutionContext {
  return {
    bridgeOnline: true,
    cameraSource: "webcam",
    demoMode: false,
    pickSource: "manual",
    placeSource: "manual",
    coordinatesConfirmed: true,
    ...overrides,
  };
}

describe("numberDuplicates", () => {
  it("numbers only duplicated labels", () => {
    const objects = numberDuplicates([
      { label: "apple", confidence: 0.9, box: null },
      { label: "apple", confidence: 0.8, box: null },
      { label: "blue box", confidence: 0.95, box: null },
    ]);
    expect(objects.map((o) => o.id)).toEqual(["apple 1", "apple 2", "blue box"]);
  });
});

describe("resolveCommand", () => {
  it("asks for the destination when only the object is given (never guesses)", () => {
    const res = resolveCommand(command({ action: "pick", destination: null, clarification: null }), [det("apple")]);
    expect(res.status).toBe("ask");
    if (res.status === "ask") expect(res.question).toContain("Where should I place the apple?");
  });

  it("reports a missing object without substituting another detection", () => {
    const res = resolveCommand(command({}), [det("banana"), det("blue box")]);
    expect(res.status).toBe("not-found");
    if (res.status === "not-found") {
      expect(res.message).toBe("I could not find an apple in the current camera view.");
    }
  });

  it("forces a manual choice between multiple matching objects", () => {
    const detections = numberDuplicates([
      { label: "apple", confidence: 0.9, box: null },
      { label: "apple", confidence: 0.85, box: null },
      { label: "apple", confidence: 0.8, box: null },
    ]);
    const res = resolveCommand(command({}), detections);
    expect(res.status).toBe("choose-object");
    if (res.status === "choose-object") {
      expect(res.candidates.map((c) => c.id)).toEqual(["apple 1", "apple 2", "apple 3"]);
    }
  });

  it("resolves a unique match", () => {
    const res = resolveCommand(command({}), [det("red apple"), det("blue box")]);
    expect(res.status).toBe("ready");
    if (res.status === "ready") expect(res.object.label).toBe("red apple");
  });

  it("matches singular/plural and partial labels", () => {
    expect(labelMatches("apple", "apples")).toBe(true);
    expect(labelMatches("box", "blue box")).toBe(true);
    expect(labelMatches("apple", "banana")).toBe(false);
  });
});

describe("templatePolicyAdapter", () => {
  it("labels itself as a skill template, not a VLA", async () => {
    const adapter = createTemplatePolicyAdapter(confirmedProfile(), input());
    expect(adapter.controlModeLabel).toBe("Verified Skill Template");
    const actions = await adapter.predict({
      images: [],
      instruction: "pick up the apple",
      robotState: { online: true, currentAction: null, progress: null, status: "idle", error: null },
    });
    expect(actions.map((a) => a.type)).toEqual([
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
  });

  it("rejects when the profile is unconfirmed", async () => {
    const demo = parseKortexFile(JSON.stringify(SAMPLE_KORTEX_FILE));
    if ("error" in demo) throw new Error(demo.error);
    const unconfirmed = inferWorkspaceProfile(demo.sequences[demo.bestSequenceIndex!]);
    const adapter = createTemplatePolicyAdapter(unconfirmed, input());
    await expect(
      adapter.predict({
        images: [],
        instruction: "pick up the apple",
        robotState: { online: true, currentAction: null, progress: null, status: "idle", error: null },
      })
    ).rejects.toThrow();
  });
});

describe("validateExecution", () => {
  const profile = confirmedProfile();
  const plan = () => {
    const adapter = createTemplatePolicyAdapter(profile, input());
    return adapter.predict({
      images: [],
      instruction: "",
      robotState: { online: true, currentAction: null, progress: null, status: "idle", error: null },
    });
  };

  it("passes a clean context", async () => {
    const items = validateExecution(input(), profile, await plan(), ctx());
    expect(hasBlockingErrors(items)).toBe(false);
    expect(items.some((i) => i.level === "ok" && i.message.includes("low speed"))).toBe(true);
  });

  it("blocks execution in Demo Mode", async () => {
    const items = validateExecution(input(), profile, await plan(), ctx({ demoMode: true, cameraSource: "uploaded-image" }));
    expect(items.some((i) => i.level === "error" && i.message.includes("Demo Mode"))).toBe(true);
  });

  it("blocks when the Robot Bridge is offline", async () => {
    const items = validateExecution(input(), profile, await plan(), ctx({ bridgeOnline: false }));
    expect(items.some((i) => i.level === "error" && i.message.includes("Robot Bridge is offline"))).toBe(true);
  });

  it("blocks unconfirmed or estimated coordinates", async () => {
    const unconfirmed = validateExecution(input(), profile, await plan(), ctx({ coordinatesConfirmed: false }));
    expect(unconfirmed.some((i) => i.level === "error" && i.message.includes("not been confirmed"))).toBe(true);

    const estimated = validateExecution(
      input(),
      profile,
      await plan(),
      ctx({ pickSource: "estimated-needs-confirmation" })
    );
    expect(estimated.some((i) => i.level === "error" && i.message.includes("estimated and unconfirmed"))).toBe(true);
  });

  it("keeps the geometric checks: below-table Z and out-of-workspace coordinates", async () => {
    const below = input({ pickZ: 0.0 });
    const items = validateExecution(below, profile, null, ctx());
    expect(items.some((i) => i.level === "error" && i.message.includes("below the confirmed table height"))).toBe(true);

    const far = input({ pickX: 2.0 });
    const farItems = validateExecution(far, profile, null, ctx());
    expect(farItems.some((i) => i.level === "error" && i.message.includes("far outside the demonstrated area"))).toBe(true);
  });

  it("warns when planning without any camera", async () => {
    const items = validateExecution(input(), profile, await plan(), ctx({ cameraSource: "none" }));
    expect(items.some((i) => i.level === "warning" && i.message.includes("No camera connected"))).toBe(true);
  });
});
