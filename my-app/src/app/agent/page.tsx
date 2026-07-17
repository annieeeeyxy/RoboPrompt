"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { parseKortexFile } from "@/lib/kortex/parser";
import { inferWorkspaceProfile } from "@/lib/kortex/inference";
import { generateKortexFile } from "@/lib/kortex/generator";
import { hasBlockingErrors } from "@/lib/kortex/validation";
import type {
  InferredParam,
  ParsedDemo,
  PickPlaceInput,
  PlannedStep,
  ValidationItem,
  WorkspaceProfile,
} from "@/lib/kortex/types";
import {
  COORDINATE_SOURCE_LABELS,
  type CameraSource,
  type DetectedObject,
  type RobotState,
  type StructuredCommand,
} from "@/lib/agent/types";
import { numberDuplicates, resolveCommand } from "@/lib/agent/commandResolver";
import { createTemplatePolicyAdapter } from "@/lib/agent/templatePolicyAdapter";
import { validateExecution } from "@/lib/agent/agentSafety";
import { DEFAULT_BRIDGE_URL, RobotBridgeClient } from "@/lib/agent/bridgeClient";
import { Stepper } from "@/components/kinova/Stepper";
import { NumberParamRow, OrientationParamRow } from "@/components/kinova/ParamRow";
import { MotionTimeline } from "@/components/kinova/MotionTimeline";
import { PathPreview } from "@/components/kinova/PathPreview";
import { SafetyCheckList } from "@/components/kinova/SafetyCheckList";
import { CameraPanel } from "@/components/agent/CameraPanel";
import { RobotStatus } from "@/components/agent/RobotStatus";

const CARD = "rounded-2xl border border-white/10 bg-[#0D1524] p-5 shadow-lg shadow-black/30";
const SECTION_TITLE = "text-xs font-semibold uppercase tracking-[0.14em] text-cyan-400/80";
const INPUT =
  "w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 font-mono text-sm text-white outline-none focus:border-cyan-400/60 placeholder:text-white/25";
const LABEL = "text-xs font-medium text-white/60";

const AGENT_STEPS = [
  { id: "connect", label: "Connect" },
  { id: "observe", label: "Observe" },
  { id: "instruct", label: "Instruct" },
  { id: "preview", label: "Preview" },
  { id: "execute", label: "Execute" },
];

const CONTROL_MODE = "Verified Skill Template";
const IDLE_ROBOT: RobotState = { online: false, currentAction: null, progress: null, status: "unknown", error: null };

function userParam<T>(value: T): InferredParam<T> {
  return { value, sourceAction: "user", reason: "Entered or edited by the user.", confidence: 1, confirmedByUser: true };
}

export default function AgentPage() {
  // Connect
  const [bridgeUrl, setBridgeUrl] = useState(DEFAULT_BRIDGE_URL);
  const [robot, setRobot] = useState<RobotState>(IDLE_ROBOT);
  const clientRef = useRef(new RobotBridgeClient(DEFAULT_BRIDGE_URL));

  // Observe
  const [cameraSource, setCameraSource] = useState<CameraSource>("none");
  const [detections, setDetections] = useState<DetectedObject[]>([]);
  const [selectedObjectId, setSelectedObjectId] = useState<string | null>(null);
  const [detecting, setDetecting] = useState(false);
  const [detectError, setDetectError] = useState<string | null>(null);

  // Instruct
  const [command, setCommand] = useState("");
  const [followUp, setFollowUp] = useState("");
  const [parsing, setParsing] = useState(false);
  const [structured, setStructured] = useState<StructuredCommand | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);

  // Skill template
  const [demo, setDemo] = useState<ParsedDemo | null>(null);
  const [skillError, setSkillError] = useState<string | null>(null);
  const [skillName, setSkillName] = useState<string | null>(null);
  const [profile, setProfile] = useState<WorkspaceProfile | null>(null);

  // Coordinates (manual — no depth camera or calibration in v1)
  const [coords, setCoords] = useState({ pickX: "", pickY: "", pickZ: "", placeX: "", placeY: "", placeZ: "" });
  const [coordsConfirmed, setCoordsConfirmed] = useState(false);

  // Preview / execute
  const [plan, setPlan] = useState<PlannedStep[] | null>(null);
  const [selectedStep, setSelectedStep] = useState<number | null>(null);
  const [validation, setValidation] = useState<ValidationItem[] | null>(null);
  const [executeError, setExecuteError] = useState<string | null>(null);

  const demoMode = cameraSource === "uploaded-image";

  useEffect(() => {
    localStorage.setItem("agent-bridge-url", bridgeUrl);
    clientRef.current = new RobotBridgeClient(bridgeUrl);
  }, [bridgeUrl]);

  useEffect(() => {
    const saved = localStorage.getItem("agent-bridge-url");
    // eslint-disable-next-line react-hooks/set-state-in-effect -- restoring persisted setting
    if (saved) setBridgeUrl(saved);
  }, []);

  // Poll the bridge: 3s idle, 1s while executing.
  useEffect(() => {
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout>;
    const tick = async () => {
      const state = await clientRef.current.getState();
      if (cancelled) return;
      setRobot(state);
      timer = setTimeout(tick, state.status === "executing" ? 1000 : 3000);
    };
    void tick();
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [bridgeUrl]);

  const invalidatePlan = useCallback(() => {
    setPlan(null);
    setValidation(null);
    setSelectedStep(null);
    setExecuteError(null);
  }, []);

  // ---- vision ----
  const runDetection = useCallback(async (frame: Blob) => {
    setDetecting(true);
    setDetectError(null);
    try {
      const formData = new FormData();
      formData.append("frame", frame, "frame.jpg");
      const res = await fetch("/api/agent/detect", { method: "POST", body: formData });
      const body = await res.json();
      if (!res.ok) throw new Error(body?.error ?? `Detection failed (${res.status})`);
      setDetections(numberDuplicates(body.objects ?? []));
      setSelectedObjectId(null);
    } catch (err) {
      setDetectError(err instanceof Error ? err.message : "Detection failed");
    } finally {
      setDetecting(false);
    }
  }, []);

  // ---- language ----
  const parseCommand = useCallback(
    async (text: string) => {
      setParsing(true);
      setParseError(null);
      invalidatePlan();
      try {
        const res = await fetch("/api/agent/parse", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ command: text }),
        });
        const body = await res.json();
        if (!res.ok) throw new Error(body?.error ?? `Parsing failed (${res.status})`);
        setStructured(body as StructuredCommand);
        setFollowUp("");
      } catch (err) {
        setParseError(err instanceof Error ? err.message : "Parsing failed");
      } finally {
        setParsing(false);
      }
    },
    [invalidatePlan]
  );

  const resolution = useMemo(
    () => (structured ? resolveCommand(structured, detections) : null),
    [structured, detections]
  );

  // The target object: resolver result, or the operator's manual selection.
  const targetObject = useMemo(() => {
    if (selectedObjectId) return detections.find((d) => d.id === selectedObjectId) ?? null;
    return resolution?.status === "ready" ? resolution.object : null;
  }, [selectedObjectId, detections, resolution]);

  const destinationLabel =
    resolution?.status === "ready" || resolution?.status === "choose-object"
      ? (resolution.destinationLabel ?? null)
      : null;

  // ---- skill template ----
  const handleSkillFile = useCallback(
    async (file: File) => {
      const result = parseKortexFile(await file.text());
      if ("error" in result) {
        setSkillError(result.error);
        return;
      }
      setSkillError(null);
      setDemo(result);
      setSkillName(file.name);
      setProfile(inferWorkspaceProfile(result.sequences[result.bestSequenceIndex ?? 0]));
      invalidatePlan();
    },
    [invalidatePlan]
  );

  const setProfileParam = useCallback(
    (key: keyof WorkspaceProfile, param: unknown) => {
      setProfile((prev) => (prev ? { ...prev, [key]: param } : prev));
      invalidatePlan();
    },
    [invalidatePlan]
  );

  const allParamsConfirmed = useMemo(() => {
    if (!profile) return false;
    return (
      [
        profile.estimatedTableHeight,
        profile.safeTravelHeight,
        profile.toolOrientation,
        profile.gripperOpenValue,
        profile.gripperCloseValue,
        profile.defaultSpeed,
      ] as { value: unknown; confirmedByUser: boolean }[]
    ).every((p) => p.value !== null && p.confirmedByUser);
  }, [profile]);

  // ---- planning ----
  const pickPlaceInput: PickPlaceInput | null = useMemo(() => {
    if (!profile || !targetObject) return null;
    const nums = {
      pickX: Number(coords.pickX),
      pickY: Number(coords.pickY),
      placeX: Number(coords.placeX),
      placeY: Number(coords.placeY),
    };
    if (
      [coords.pickX, coords.pickY, coords.placeX, coords.placeY].some((s) => s.trim() === "") ||
      Object.values(nums).some((n) => !Number.isFinite(n))
    ) {
      return null;
    }
    const optional = (s: string) => (s.trim() === "" ? null : Number(s));
    return {
      taskName: `agent_${targetObject.label.replace(/\s+/g, "_")}`,
      objectName: targetObject.id,
      ...nums,
      pickZ: optional(coords.pickZ),
      placeZ: optional(coords.placeZ),
      speedLevel: "slow", // execution defaults to low speed
      gripperOpen: profile.gripperOpenValue.value ?? NaN,
      gripperClose: profile.gripperCloseValue.value ?? NaN,
    };
  }, [profile, targetObject, coords]);

  const previewPlan = useCallback(async () => {
    setExecuteError(null);
    if (!profile || !pickPlaceInput) {
      setValidation([
        {
          level: "error",
          message:
            "Preview needs a confirmed Robot Skill, a selected target object, and pick/place coordinates.",
        },
      ]);
      setPlan(null);
      return;
    }
    let nextPlan: PlannedStep[] | null = null;
    try {
      nextPlan = await createTemplatePolicyAdapter(profile, pickPlaceInput).predict({
        images: [],
        instruction: command,
        robotState: robot,
      });
    } catch {
      nextPlan = null;
    }
    setPlan(nextPlan);
    setSelectedStep(null);
    setValidation(
      validateExecution(pickPlaceInput, profile, nextPlan, {
        bridgeOnline: robot.online,
        cameraSource,
        demoMode,
        pickSource: "manual",
        placeSource: "manual",
        coordinatesConfirmed: coordsConfirmed,
      })
    );
  }, [profile, pickPlaceInput, command, robot, cameraSource, demoMode, coordsConfirmed]);

  const canExecute =
    plan !== null &&
    validation !== null &&
    !hasBlockingErrors(validation) &&
    robot.online &&
    !demoMode;

  const confirmAndRun = useCallback(async () => {
    if (!canExecute || !plan || !pickPlaceInput || !profile || !demo) return;
    setExecuteError(null);
    const kortex = generateKortexFile(plan, pickPlaceInput, profile, demo.raw);
    if ("error" in kortex) {
      setExecuteError(kortex.error);
      return;
    }
    try {
      await clientRef.current.execute({
        taskName: pickPlaceInput.taskName,
        objectName: pickPlaceInput.objectName,
        steps: plan,
        speedLevel: "slow",
        kortexSequence: kortex,
      });
      setRobot(await clientRef.current.getState());
    } catch (err) {
      setExecuteError(err instanceof Error ? err.message : "Execution request failed");
    }
  }, [canExecute, plan, pickPlaceInput, profile, demo]);

  // ---- stepper state ----
  const doneSteps = useMemo(() => {
    const done = new Set<string>();
    if (robot.online || demoMode) done.add("connect");
    if (detections.length > 0) done.add("observe");
    if (targetObject && destinationLabel) done.add("instruct");
    if (plan && validation && !hasBlockingErrors(validation)) done.add("preview");
    if (robot.status === "completed") done.add("execute");
    return done;
  }, [robot, demoMode, detections, targetObject, destinationLabel, plan, validation]);

  const activeStep = !doneSteps.has("connect")
    ? "connect"
    : !doneSteps.has("observe")
      ? "observe"
      : !doneSteps.has("instruct")
        ? "instruct"
        : !doneSteps.has("preview")
          ? "preview"
          : "execute";

  const selected = selectedStep !== null && plan ? plan[selectedStep] : null;

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-4 py-10">
      <header className="flex flex-col gap-4">
        <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
          See it. Describe it. <span className="text-cyan-400">Move it.</span>
        </h1>
        <p className="max-w-2xl text-base leading-7 text-white/55">
          Language-guided robot control built on verified motion skills.
        </p>
        <Stepper done={doneSteps} active={activeStep} steps={AGENT_STEPS} />
        <div className="rounded-xl border border-red-500/25 bg-red-500/5 px-4 py-3 text-xs leading-5 text-red-200">
          ⚠ Run at low speed, keep the workspace clear, and keep the emergency stop accessible. The web app
          never moves the arm without an explicit Confirm &amp; Run.
        </div>
      </header>

      <RobotStatus
        bridgeUrl={bridgeUrl}
        onBridgeUrlChange={setBridgeUrl}
        robot={robot}
        cameraSource={cameraSource}
        controlMode={CONTROL_MODE}
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        {/* ---- Left: Live Vision ---- */}
        <section className={CARD}>
          <p className={SECTION_TITLE}>Live Vision</p>
          <div className="mt-4">
            <CameraPanel
              source={cameraSource}
              onSourceChange={(s) => {
                setCameraSource(s);
                setDetections([]);
                setSelectedObjectId(null);
                invalidatePlan();
              }}
              detections={detections}
              selectedId={selectedObjectId}
              onSelect={(id) => {
                setSelectedObjectId(id);
                invalidatePlan();
              }}
              onDetect={(frame) => void runDetection(frame)}
              detecting={detecting}
              detectError={detectError}
            />
          </div>
        </section>

        {/* ---- Right: Command & Plan ---- */}
        <section className={CARD}>
          <p className={SECTION_TITLE}>Command &amp; Plan</p>
          <div className="mt-4 flex flex-col gap-3">
            <label className={LABEL}>What should the robot do?</label>
            <div className="flex gap-2">
              <input
                className={INPUT}
                value={command}
                placeholder="Pick up the apple and place it in the blue box."
                onChange={(e) => setCommand(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && command.trim()) void parseCommand(command.trim());
                }}
              />
              <button
                onClick={() => void parseCommand(command.trim())}
                disabled={!command.trim() || parsing}
                className="shrink-0 rounded-full bg-cyan-500/90 px-5 py-2 text-sm font-medium text-black hover:bg-cyan-400 disabled:opacity-30"
              >
                {parsing ? "Parsing…" : "Generate Plan"}
              </button>
            </div>
            <p className="text-[11px] text-white/35">
              Examples: “Pick up the apple.” · “Put the apple in the blue box.” · “Move the red block to the
              tray.”
            </p>

            {parseError && <p className="text-xs text-red-300">{parseError}</p>}

            {structured && (
              <pre className="rounded-lg border border-white/10 bg-black/40 px-3 py-2 font-mono text-[11px] text-cyan-100/80">
                {JSON.stringify(
                  { action: structured.action, object: structured.object, destination: structured.destination },
                  null,
                  2
                )}
              </pre>
            )}

            {resolution?.status === "ask" && (
              <div className="rounded-lg border border-amber-500/25 bg-amber-500/5 px-3 py-2.5">
                <p className="text-xs text-amber-200">{resolution.question}</p>
                <div className="mt-2 flex gap-2">
                  <input
                    className={INPUT}
                    value={followUp}
                    placeholder="Answer…"
                    onChange={(e) => setFollowUp(e.target.value)}
                  />
                  <button
                    onClick={() => void parseCommand(`${command.trim()} ${followUp.trim()}`.trim())}
                    disabled={!followUp.trim() || parsing}
                    className="shrink-0 rounded-full border border-cyan-400/50 px-4 py-1.5 text-xs text-cyan-300 hover:bg-cyan-400/10 disabled:opacity-30"
                  >
                    Send
                  </button>
                </div>
              </div>
            )}
            {resolution?.status === "not-found" && (
              <p className="rounded-lg border border-red-500/30 bg-red-500/5 px-3 py-2 text-xs text-red-200">
                {resolution.message} Refresh the detection, or select the object manually — the robot will
                never substitute a different object on its own.
              </p>
            )}
            {resolution?.status === "choose-object" && !selectedObjectId && (
              <p className="rounded-lg border border-amber-500/25 bg-amber-500/5 px-3 py-2 text-xs text-amber-200">
                I found {resolution.candidates.length} matching objects (
                {resolution.candidates.map((c) => c.id).join(", ")}). Select the one you mean in the Live
                Vision panel — I won&apos;t guess.
              </p>
            )}
            {targetObject && (
              <p className="text-xs text-emerald-300">
                Target: <span className="font-mono">{targetObject.id}</span>
                {destinationLabel && (
                  <>
                    {" "}
                    → destination: <span className="font-mono">{destinationLabel}</span>
                  </>
                )}
              </p>
            )}
          </div>

          {/* Coordinates */}
          <div className="mt-6">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-sm font-semibold text-white/90">Coordinates</h2>
              <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white/60">
                {COORDINATE_SOURCE_LABELS.manual}
              </span>
            </div>
            <p className="mt-1.5 text-[11px] leading-4 text-white/40">
              No depth camera or camera calibration is connected, so pixels cannot become robot coordinates.
              Enter robot-frame coordinates manually, teach them in Kortex, or set up camera calibration.
            </p>
            <div className="mt-3 grid grid-cols-3 gap-2">
              {(
                [
                  ["pickX", "Pick X (m)"],
                  ["pickY", "Pick Y (m)"],
                  ["pickZ", "Pick Z (opt)"],
                  ["placeX", "Place X (m)"],
                  ["placeY", "Place Y (m)"],
                  ["placeZ", "Place Z (opt)"],
                ] as const
              ).map(([key, label]) => (
                <div key={key}>
                  <label className="text-[10px] text-white/40">{label}</label>
                  <input
                    className={INPUT}
                    value={coords[key]}
                    onChange={(e) => {
                      setCoords((prev) => ({ ...prev, [key]: e.target.value }));
                      setCoordsConfirmed(false);
                      invalidatePlan();
                    }}
                  />
                </div>
              ))}
            </div>
            <label className="mt-2.5 flex cursor-pointer items-center gap-2 text-xs text-white/60">
              <input
                type="checkbox"
                checked={coordsConfirmed}
                onChange={(e) => {
                  setCoordsConfirmed(e.target.checked);
                  invalidatePlan();
                }}
                className="h-4 w-4 accent-emerald-400"
              />
              I confirm these coordinates are correct for this robot&apos;s base frame.
            </label>
          </div>
        </section>
      </div>

      {/* ---- Robot Skill ---- */}
      <section className={CARD}>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className={SECTION_TITLE}>Robot Skill — verified demonstration</p>
          <label className="cursor-pointer rounded-full bg-cyan-500/90 px-4 py-2 text-xs font-medium text-black hover:bg-cyan-400">
            Upload Kortex JSON
            <input
              type="file"
              accept=".json,application/json"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) void handleSkillFile(file);
                e.target.value = "";
              }}
            />
          </label>
        </div>
        <p className="mt-2 text-xs text-white/40">
          A sequence export that ran successfully on your real Kinova arm. It provides the verified motion
          structure and safety parameters; only your confirmed pick/place coordinates are swapped in. This is
          a skill template — not a trained VLA model.
        </p>
        {skillError && <p className="mt-2 text-xs text-red-300">{skillError}</p>}
        {skillName && demo && (
          <p className="mt-2 font-mono text-xs text-white/50">
            {skillName} · {demo.sequences.length} sequences · using “
            {demo.sequences[demo.bestSequenceIndex ?? 0].name}”
          </p>
        )}
        {profile && (
          <div className="mt-4 grid gap-3 lg:grid-cols-2">
            <NumberParamRow
              label="Estimated table height (contact Z) — estimated from demonstration"
              unit="m"
              param={profile.estimatedTableHeight}
              onConfirm={() => setProfileParam("estimatedTableHeight", { ...profile.estimatedTableHeight, confirmedByUser: true })}
              onEdit={(v) => setProfileParam("estimatedTableHeight", userParam(v))}
            />
            <NumberParamRow
              label="Safe travel height"
              unit="m"
              param={profile.safeTravelHeight}
              onConfirm={() => setProfileParam("safeTravelHeight", { ...profile.safeTravelHeight, confirmedByUser: true })}
              onEdit={(v) => setProfileParam("safeTravelHeight", userParam(v))}
            />
            <OrientationParamRow
              param={profile.toolOrientation}
              onConfirm={() => setProfileParam("toolOrientation", { ...profile.toolOrientation, confirmedByUser: true })}
              onEdit={(v) => setProfileParam("toolOrientation", userParam(v))}
            />
            <NumberParamRow
              label="Default speed (translation)"
              unit="m/s"
              digits={3}
              param={profile.defaultSpeed}
              onConfirm={() => setProfileParam("defaultSpeed", { ...profile.defaultSpeed, confirmedByUser: true })}
              onEdit={(v) => setProfileParam("defaultSpeed", userParam(v))}
            />
            <NumberParamRow
              label="Gripper OPEN value"
              unit="0–1"
              param={profile.gripperOpenValue}
              onConfirm={() => setProfileParam("gripperOpenValue", { ...profile.gripperOpenValue, confirmedByUser: true })}
              onEdit={(v) => setProfileParam("gripperOpenValue", userParam(v))}
            />
            <NumberParamRow
              label="Gripper CLOSE value"
              unit="0–1"
              param={profile.gripperCloseValue}
              onConfirm={() => setProfileParam("gripperCloseValue", { ...profile.gripperCloseValue, confirmedByUser: true })}
              onEdit={(v) => setProfileParam("gripperCloseValue", userParam(v))}
            />
          </div>
        )}
        {profile && !allParamsConfirmed && (
          <p className="mt-3 rounded-lg border border-amber-500/25 bg-amber-500/5 px-3 py-2 text-xs text-amber-200">
            Unconfirmed parameters are never used for real execution — confirm or edit each value above.
          </p>
        )}
      </section>

      {/* ---- Preview & Execute ---- */}
      <section className={CARD}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className={SECTION_TITLE}>Motion Preview &amp; Safety</p>
          <div className="flex gap-2">
            <button
              onClick={() => void previewPlan()}
              className="rounded-full border border-cyan-400/50 px-5 py-2 text-sm font-medium text-cyan-300 hover:bg-cyan-400/10"
            >
              Preview Plan
            </button>
            <button
              onClick={() => void confirmAndRun()}
              disabled={!canExecute}
              className="rounded-full bg-emerald-500/90 px-5 py-2 text-sm font-semibold text-black hover:bg-emerald-400 disabled:opacity-30"
              title={canExecute ? "Send to the Robot Bridge" : "Resolve all red items first"}
            >
              Confirm &amp; Run
            </button>
            {robot.online && robot.status === "executing" && (
              <>
                <button
                  onClick={() => void clientRef.current.pause()}
                  className="rounded-full border border-amber-400/50 px-4 py-2 text-sm text-amber-300 hover:bg-amber-400/10"
                >
                  Pause
                </button>
                <button
                  onClick={() => void clientRef.current.stop()}
                  className="rounded-full bg-red-500/90 px-4 py-2 text-sm font-semibold text-white hover:bg-red-400"
                >
                  STOP
                </button>
              </>
            )}
          </div>
        </div>
        {executeError && (
          <p className="mt-3 rounded-lg border border-red-500/30 bg-red-500/5 px-3 py-2 text-xs text-red-200">{executeError}</p>
        )}

        {plan ? (
          <div className="mt-4 grid gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
            <div>
              <h2 className="mb-2 text-sm font-semibold text-white/90">Motion timeline — click a step</h2>
              <MotionTimeline plan={plan} selectedIndex={selectedStep} onSelect={setSelectedStep} />
              {selected && (
                <div className="mt-3 rounded-xl border border-cyan-400/30 bg-cyan-400/[0.04] p-3 font-mono text-xs leading-6 text-white/75">
                  <p className="font-semibold text-cyan-300">{selected.type}</p>
                  <p>target: {selected.type.startsWith("PLACE") || selected.type === "RETREAT" || selected.type === "RELEASE" ? (destinationLabel ?? "—") : (targetObject?.id ?? "—")}</p>
                  {selected.pose ? (
                    <>
                      <p>
                        x {selected.pose.x.toFixed(4)} · y {selected.pose.y.toFixed(4)} · z {selected.pose.z.toFixed(4)} m
                      </p>
                      <p>
                        θ {selected.pose.thetaX.toFixed(1)} / {selected.pose.thetaY.toFixed(1)} / {selected.pose.thetaZ.toFixed(1)}°{" "}
                        <span className="text-white/40">(from skill, confirmed)</span>
                      </p>
                      <p>
                        speed: slow ({((profile?.defaultSpeed.value ?? 0) * 0.5).toFixed(3)} m/s) ·
                        sources: X/Y {COORDINATE_SOURCE_LABELS.manual.toLowerCase()}, Z {selected.segment === "descend" ? "confirmed table height" : "confirmed safe height"}
                      </p>
                    </>
                  ) : (
                    <p>gripper → {selected.gripperValue?.toFixed(4)} (from skill, confirmed)</p>
                  )}
                  <p>
                    validation:{" "}
                    {validation && !hasBlockingErrors(validation) ? (
                      <span className="text-emerald-300">passing</span>
                    ) : (
                      <span className="text-red-300">blocked — see safety check</span>
                    )}
                  </p>
                </div>
              )}
            </div>
            <div>
              <h2 className="mb-2 text-sm font-semibold text-white/90">Path preview (table, top view)</h2>
              <PathPreview plan={plan} bounds={profile?.bounds ?? null} showRobotBase />
            </div>
          </div>
        ) : (
          <p className="mt-4 text-sm text-white/40">
            Click Preview Plan once a target is selected, the skill is confirmed, and coordinates are entered.
            Nothing is sent to the robot at preview time.
          </p>
        )}

        {validation && (
          <div className="mt-5">
            <h2 className="mb-2 text-sm font-semibold text-white/90">Safety check</h2>
            <SafetyCheckList items={validation} />
          </div>
        )}
      </section>
    </main>
  );
}
