"use client";

import { useCallback, useMemo, useState } from "react";
import Link from "next/link";
import { parseKortexFile } from "@/lib/kortex/parser";
import { inferWorkspaceProfile } from "@/lib/kortex/inference";
import { generateKortexFile, planPickPlace } from "@/lib/kortex/generator";
import { hasBlockingErrors, validatePlan } from "@/lib/kortex/validation";
import { SAMPLE_KORTEX_FILE } from "@/lib/kortex/sample";
import type {
  InferredParam,
  KortexFile,
  ParsedDemo,
  PickPlaceInput,
  PlannedStep,
  ValidationItem,
  WorkspaceProfile,
} from "@/lib/kortex/types";
import { Stepper, type StepId } from "@/components/kinova/Stepper";
import { NumberParamRow, OrientationParamRow } from "@/components/kinova/ParamRow";
import { MotionTimeline } from "@/components/kinova/MotionTimeline";
import { PathPreview } from "@/components/kinova/PathPreview";
import { SafetyCheckList } from "@/components/kinova/SafetyCheckList";

const CARD = "rounded-2xl border border-white/10 bg-[#0D1524] p-6 shadow-lg shadow-black/30";
const SECTION_TITLE = "text-xs font-semibold uppercase tracking-[0.14em] text-cyan-400/80";
const INPUT =
  "w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 font-mono text-sm text-white outline-none focus:border-cyan-400/60 placeholder:text-white/25";
const LABEL = "text-xs font-medium text-white/60";

const MODELS = ["Kinova Gen3", "Kinova Gen3 lite", "Other / not sure"];

type FormState = {
  taskName: string;
  objectName: string;
  pickX: string;
  pickY: string;
  placeX: string;
  placeY: string;
  pickZ: string;
  placeZ: string;
  speedLevel: "slow" | "normal";
  gripperOpen: string;
  gripperClose: string;
};

const EMPTY_FORM: FormState = {
  taskName: "",
  objectName: "",
  pickX: "",
  pickY: "",
  placeX: "",
  placeY: "",
  pickZ: "",
  placeZ: "",
  speedLevel: "slow",
  gripperOpen: "",
  gripperClose: "",
};

function userParam<T>(value: T): InferredParam<T> {
  return { value, sourceAction: "user", reason: "Entered or edited by the user.", confidence: 1, confirmedByUser: true };
}

export default function KinovaPage() {
  const [robotModel, setRobotModel] = useState(MODELS[0]);
  const [modelConfirmed, setModelConfirmed] = useState(false);
  const [parsed, setParsed] = useState<ParsedDemo | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [seqIndex, setSeqIndex] = useState(0);
  const [profile, setProfile] = useState<WorkspaceProfile | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [validation, setValidation] = useState<ValidationItem[] | null>(null);
  const [generateError, setGenerateError] = useState<string | null>(null);
  const [generated, setGenerated] = useState<{ file: KortexFile; plan: PlannedStep[]; name: string } | null>(null);
  const [markedTested, setMarkedTested] = useState(false);

  const invalidateDownstream = useCallback(() => {
    setValidation(null);
    setGenerated(null);
    setGenerateError(null);
    setMarkedTested(false);
  }, []);

  const adoptDemo = useCallback(
    (demo: ParsedDemo, name: string) => {
      setParsed(demo);
      setFileName(name);
      setParseError(null);
      const index = demo.bestSequenceIndex ?? 0;
      setSeqIndex(index);
      const inferred = inferWorkspaceProfile(demo.sequences[index]);
      setProfile(inferred);
      setForm((prev) => ({
        ...prev,
        gripperOpen: inferred.gripperOpenValue.value?.toFixed(4) ?? prev.gripperOpen,
        gripperClose: inferred.gripperCloseValue.value?.toFixed(4) ?? prev.gripperClose,
      }));
      invalidateDownstream();
    },
    [invalidateDownstream]
  );

  const handleFile = useCallback(
    async (file: File) => {
      const result = parseKortexFile(await file.text());
      if ("error" in result) {
        setParseError(result.error);
        return;
      }
      adoptDemo(result, file.name);
    },
    [adoptDemo]
  );

  const handleLoadSample = useCallback(() => {
    const result = parseKortexFile(JSON.stringify(SAMPLE_KORTEX_FILE));
    if (!("error" in result)) adoptDemo(result, "sample demonstration (built-in mock)");
  }, [adoptDemo]);

  const switchSequence = useCallback(
    (index: number) => {
      if (!parsed) return;
      setSeqIndex(index);
      setProfile(inferWorkspaceProfile(parsed.sequences[index]));
      invalidateDownstream();
    },
    [parsed, invalidateDownstream]
  );

  const setProfileParam = useCallback(
    (key: keyof WorkspaceProfile, param: unknown) => {
      setProfile((prev) => (prev ? { ...prev, [key]: param } : prev));
      invalidateDownstream();
    },
    [invalidateDownstream]
  );

  const setFormField = useCallback(
    (field: keyof FormState, value: string) => {
      setForm((prev) => ({ ...prev, [field]: value }));
      invalidateDownstream();
    },
    [invalidateDownstream]
  );

  // ---- derived -------------------------------------------------------------

  const input: PickPlaceInput | null = useMemo(() => {
    const nums = {
      pickX: Number(form.pickX),
      pickY: Number(form.pickY),
      placeX: Number(form.placeX),
      placeY: Number(form.placeY),
      gripperOpen: Number(form.gripperOpen),
      gripperClose: Number(form.gripperClose),
    };
    if (
      [form.pickX, form.pickY, form.placeX, form.placeY, form.gripperOpen, form.gripperClose].some(
        (s) => s.trim() === ""
      ) ||
      Object.values(nums).some((n) => !Number.isFinite(n))
    ) {
      return null;
    }
    const optional = (s: string) => (s.trim() === "" ? null : Number(s));
    const pickZ = optional(form.pickZ);
    const placeZ = optional(form.placeZ);
    if ((pickZ !== null && !Number.isFinite(pickZ)) || (placeZ !== null && !Number.isFinite(placeZ))) return null;
    return {
      taskName: form.taskName || "RoboPrompt_pick_and_place",
      objectName: form.objectName || "object",
      ...nums,
      pickZ,
      placeZ,
      speedLevel: form.speedLevel,
    };
  }, [form]);

  const plan = useMemo(
    () => (input && profile ? planPickPlace(input, profile) : null),
    [input, profile]
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

  const doneSteps = useMemo(() => {
    const done = new Set<StepId>();
    if (modelConfirmed) done.add("identify");
    if (allParamsConfirmed) done.add("learn");
    if (input) done.add("create");
    if (validation && !hasBlockingErrors(validation)) done.add("validate");
    if (generated) done.add("export");
    return done;
  }, [modelConfirmed, allParamsConfirmed, input, validation, generated]);

  const activeStep: StepId = !modelConfirmed
    ? "identify"
    : !allParamsConfirmed
      ? "learn"
      : !input
        ? "create"
        : !validation || hasBlockingErrors(validation)
          ? "validate"
          : "export";

  // ---- actions -------------------------------------------------------------

  const runValidate = useCallback(() => {
    if (!input || !profile) {
      setValidation([{ level: "error", message: "Fill in the task inputs (and confirm the workspace profile) first." }]);
      return null;
    }
    const items = validatePlan(input, profile, plan);
    setValidation(items);
    return items;
  }, [input, profile, plan]);

  const runGenerate = useCallback(() => {
    setGenerateError(null);
    const items = runValidate();
    if (!items || hasBlockingErrors(items) || !input || !profile || !plan || !parsed) return;
    const file = generateKortexFile(plan, input, profile, parsed.raw);
    if ("error" in file) {
      setGenerateError(file.error);
      return;
    }
    setGenerated({ file, plan, name: input.taskName });
    setMarkedTested(false);
  }, [runValidate, input, profile, plan, parsed]);

  const downloadGenerated = useCallback(() => {
    if (!generated) return;
    const blob = new Blob([JSON.stringify(generated.file)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${generated.name.replace(/\s+/g, "_")}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [generated]);

  const resetAll = useCallback(() => {
    setParsed(null);
    setParseError(null);
    setFileName(null);
    setSeqIndex(0);
    setProfile(null);
    setForm(EMPTY_FORM);
    setModelConfirmed(false);
    invalidateDownstream();
  }, [invalidateDownstream]);

  const sequence = parsed?.sequences[seqIndex] ?? null;

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8 px-4 py-10">
      {/* Hero */}
      <header className="flex flex-col gap-4">
        <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
          Teach once. <span className="text-cyan-400">Generate safely.</span>
        </h1>
        <p className="max-w-2xl text-base leading-7 text-white/55">
          Turn one verified robot demonstration into reusable, editable automation.
        </p>
        <Stepper done={doneSteps} active={activeStep} />
        <div className="rounded-xl border border-red-500/25 bg-red-500/5 px-4 py-3 text-xs leading-5 text-red-200">
          ⚠ This tool never controls the arm. Preview the trajectory in Kortex, run at low speed, keep the
          workspace clear, and keep the emergency stop accessible.
        </div>
      </header>

      {/* 1 — Identify */}
      <section id="identify" className={CARD}>
        <p className={SECTION_TITLE}>1 · Identify — Robot status</p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
            <p className={LABEL}>Control interface</p>
            {parsed ? (
              <p className="mt-1 font-mono text-sm text-emerald-300">
                Kinova Kortex <span className="ml-1 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-semibold uppercase">Confirmed</span>
              </p>
            ) : (
              <p className="mt-1 font-mono text-sm text-amber-300">
                Unknown — upload a Kortex JSON in step 2 to confirm
              </p>
            )}
            <p className="mt-2 text-xs leading-5 text-white/45">
              A successfully parsed Kortex sequence export is direct evidence the arm speaks Kortex. Nothing
              else about the robot is assumed from it.
            </p>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
            <div className="flex items-center justify-between gap-2">
              <p className={LABEL}>Brand &amp; model</p>
              {modelConfirmed ? (
                <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-semibold uppercase text-emerald-300">Confirmed</span>
              ) : (
                <span className="rounded-full bg-amber-500/15 px-2 py-0.5 text-[10px] font-semibold uppercase text-amber-300">Needs confirmation</span>
              )}
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <select
                value={robotModel}
                onChange={(e) => {
                  setRobotModel(e.target.value);
                  setModelConfirmed(false);
                }}
                className="rounded-lg border border-white/10 bg-black/40 px-3 py-2 font-mono text-sm text-white outline-none focus:border-cyan-400/60"
              >
                {MODELS.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
              {!modelConfirmed && (
                <button
                  onClick={() => setModelConfirmed(true)}
                  className="rounded-full bg-emerald-500/90 px-3 py-1.5 text-xs font-medium text-black hover:bg-emerald-400"
                >
                  Confirm
                </button>
              )}
            </div>
            <p className="mt-2 text-xs leading-5 text-white/45">
              The Kortex export contains no model information, and a photo alone cannot reliably identify the
              exact model — so this stays &quot;Needs confirmation&quot; until you confirm it. For AI photo
              identification, use{" "}
              <Link href="/try" className="text-cyan-400 hover:underline">
                the Try&nbsp;it flow
              </Link>
              .
            </p>
          </div>
        </div>
      </section>

      {/* 2 — Learn */}
      <section id="learn" className={CARD}>
        <p className={SECTION_TITLE}>2 · Learn — Workspace from demonstration</p>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <label className="cursor-pointer rounded-full bg-cyan-500/90 px-5 py-2.5 text-sm font-medium text-black transition-colors hover:bg-cyan-400">
            Upload Kortex JSON
            <input
              type="file"
              accept=".json,application/json"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) void handleFile(file);
                e.target.value = "";
              }}
            />
          </label>
          <button
            onClick={handleLoadSample}
            className="rounded-full border border-white/15 px-4 py-2 text-xs text-white/70 hover:border-cyan-400/50 hover:text-cyan-300"
          >
            Load sample demo
          </button>
          {fileName && (
            <span className="font-mono text-xs text-white/50">
              {fileName} · {parsed?.sequences.length} sequence{(parsed?.sequences.length ?? 0) > 1 ? "s" : ""}
            </span>
          )}
        </div>
        <p className="mt-2 text-xs text-white/40">
          Upload a sequence export that ran successfully on the real arm. The file is parsed in your browser
          and never modified.
        </p>
        {parseError && (
          <p className="mt-3 rounded-lg border border-red-500/30 bg-red-500/5 px-3 py-2 text-xs text-red-200">{parseError}</p>
        )}
        {parsed && parsed.warnings.length > 0 && (
          <ul className="mt-3 flex flex-col gap-1">
            {parsed.warnings.map((w, i) => (
              <li key={i} className="text-xs text-amber-300/80">⚠ {w}</li>
            ))}
          </ul>
        )}

        {parsed && sequence && (
          <>
            <div className="mt-5 flex flex-wrap items-center gap-3">
              <p className={LABEL}>Demonstration sequence</p>
              <select
                value={seqIndex}
                onChange={(e) => switchSequence(Number(e.target.value))}
                className="rounded-lg border border-white/10 bg-black/40 px-3 py-1.5 font-mono text-xs text-white outline-none focus:border-cyan-400/60"
              >
                {parsed.sequences.map((seq, i) => (
                  <option key={i} value={i}>
                    {seq.name} ({seq.poseCount} poses, {seq.gripperCount} gripper)
                  </option>
                ))}
              </select>
              {parsed.bestSequenceIndex === seqIndex && (
                <span className="rounded-full bg-cyan-400/10 px-2 py-0.5 text-[10px] font-semibold uppercase text-cyan-300">
                  Auto-selected richest demo
                </span>
              )}
            </div>

            <div className="mt-4 overflow-x-auto rounded-xl border border-white/10">
              <table className="w-full min-w-[640px] text-left font-mono text-xs">
                <thead className="bg-white/[0.04] text-white/40">
                  <tr>
                    <th className="px-3 py-2 font-medium">#</th>
                    <th className="px-3 py-2 font-medium">Action</th>
                    <th className="px-3 py-2 font-medium">x (m)</th>
                    <th className="px-3 py-2 font-medium">y (m)</th>
                    <th className="px-3 py-2 font-medium">z (m)</th>
                    <th className="px-3 py-2 font-medium">θX / θY / θZ (°)</th>
                    <th className="px-3 py-2 font-medium">speed / grip</th>
                  </tr>
                </thead>
                <tbody className="text-white/75">
                  {sequence.steps.map((step) => (
                    <tr key={step.index} className="border-t border-white/5">
                      <td className="px-3 py-1.5 text-white/35">{step.index + 1}</td>
                      <td className="px-3 py-1.5">{step.name}</td>
                      {step.kind === "pose" ? (
                        <>
                          <td className="px-3 py-1.5">{step.pose.x.toFixed(4)}</td>
                          <td className="px-3 py-1.5">{step.pose.y.toFixed(4)}</td>
                          <td className="px-3 py-1.5 text-cyan-300">{step.pose.z.toFixed(4)}</td>
                          <td className="px-3 py-1.5">
                            {step.pose.thetaX.toFixed(1)} / {step.pose.thetaY.toFixed(1)} / {step.pose.thetaZ.toFixed(1)}
                          </td>
                          <td className="px-3 py-1.5">{step.speedTranslation?.toFixed(2) ?? "—"} m/s</td>
                        </>
                      ) : step.kind === "gripper" ? (
                        <>
                          <td className="px-3 py-1.5 text-white/30" colSpan={4}>
                            gripper command
                          </td>
                          <td className="px-3 py-1.5 text-emerald-300">{step.value.toFixed(4)}</td>
                        </>
                      ) : (
                        <td className="px-3 py-1.5 text-white/30" colSpan={5}>
                          (unrecognized action — ignored)
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {profile && (
          <div className="mt-6">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-sm font-semibold text-white/90">Workspace Profile</h2>
              <p className="text-xs text-white/40">
                from <span className="font-mono">{profile.sourceSequenceName}</span> — confirm every value
                before it is used
              </p>
            </div>
            <div className="mt-3 grid gap-3 lg:grid-cols-2">
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
            {profile.bounds && (
              <p className="mt-3 font-mono text-xs text-white/40">
                Demonstrated bounds: x {profile.bounds.minX.toFixed(3)}…{profile.bounds.maxX.toFixed(3)} · y{" "}
                {profile.bounds.minY.toFixed(3)}…{profile.bounds.maxY.toFixed(3)} · z {profile.bounds.minZ.toFixed(3)}…
                {profile.bounds.maxZ.toFixed(3)} m
              </p>
            )}
          </div>
        )}
      </section>

      {/* 3 — Create */}
      <section id="create" className={CARD}>
        <p className={SECTION_TITLE}>3 · Create — New pick-and-place task</p>
        {!allParamsConfirmed && (
          <p className="mt-3 rounded-lg border border-amber-500/25 bg-amber-500/5 px-3 py-2 text-xs text-amber-200">
            Confirm every Workspace Profile value above before creating a task — only confirmed parameters are
            used for generation.
          </p>
        )}
        <p className="mt-3 text-xs leading-5 text-white/45">
          A tabletop photo cannot provide reliable robot X/Y coordinates (that needs camera calibration,
          AprilTag/ArUco markers, or a depth camera). Enter coordinates in the robot&apos;s base frame — jog
          the arm in Kortex to read them off, or reuse values from the demonstration table above.
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="sm:col-span-2">
            <label className={LABEL}>Task name</label>
            <input className={INPUT} value={form.taskName} placeholder="pick_bolt_to_tray" onChange={(e) => setFormField("taskName", e.target.value)} />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL}>Object name</label>
            <input className={INPUT} value={form.objectName} placeholder="M8 bolt" onChange={(e) => setFormField("objectName", e.target.value)} />
          </div>
          <div>
            <label className={LABEL}>Pick X (m)</label>
            <input className={INPUT} value={form.pickX} placeholder="0.60" onChange={(e) => setFormField("pickX", e.target.value)} />
          </div>
          <div>
            <label className={LABEL}>Pick Y (m)</label>
            <input className={INPUT} value={form.pickY} placeholder="0.03" onChange={(e) => setFormField("pickY", e.target.value)} />
          </div>
          <div>
            <label className={LABEL}>Place X (m)</label>
            <input className={INPUT} value={form.placeX} placeholder="0.71" onChange={(e) => setFormField("placeX", e.target.value)} />
          </div>
          <div>
            <label className={LABEL}>Place Y (m)</label>
            <input className={INPUT} value={form.placeY} placeholder="0.03" onChange={(e) => setFormField("placeY", e.target.value)} />
          </div>
          <div>
            <label className={LABEL}>Pick Z (m, optional)</label>
            <input className={INPUT} value={form.pickZ} placeholder="table height" onChange={(e) => setFormField("pickZ", e.target.value)} />
          </div>
          <div>
            <label className={LABEL}>Place Z (m, optional)</label>
            <input className={INPUT} value={form.placeZ} placeholder="table height" onChange={(e) => setFormField("placeZ", e.target.value)} />
          </div>
          <div>
            <label className={LABEL}>Speed</label>
            <div className="mt-1 flex gap-1 rounded-lg border border-white/10 bg-black/40 p-1">
              {(["slow", "normal"] as const).map((level) => (
                <button
                  key={level}
                  onClick={() => setFormField("speedLevel", level)}
                  className={`flex-1 rounded-md px-3 py-1.5 text-xs font-medium capitalize transition-colors ${
                    form.speedLevel === level ? "bg-cyan-500/90 text-black" : "text-white/50 hover:text-white/80"
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className={LABEL}>Gripper OPEN</label>
            <input className={INPUT} value={form.gripperOpen} onChange={(e) => setFormField("gripperOpen", e.target.value)} />
          </div>
          <div>
            <label className={LABEL}>Gripper CLOSE</label>
            <input className={INPUT} value={form.gripperClose} onChange={(e) => setFormField("gripperClose", e.target.value)} />
          </div>
        </div>
      </section>

      {/* 4 — Validate */}
      <section id="validate" className={CARD}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className={SECTION_TITLE}>4 · Validate — Timeline, path &amp; safety</p>
          <button
            onClick={runValidate}
            className="rounded-full border border-cyan-400/50 px-5 py-2 text-sm font-medium text-cyan-300 transition-colors hover:bg-cyan-400/10"
          >
            Validate
          </button>
        </div>

        {plan ? (
          <div className="mt-4 grid gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
            <div>
              <h2 className="mb-2 text-sm font-semibold text-white/90">Motion timeline</h2>
              <MotionTimeline plan={plan} />
              <p className="mt-3 font-mono text-xs text-white/40">
                {form.objectName || "object"}: ({form.pickX}, {form.pickY}) → ({form.placeX}, {form.placeY}) ·
                table {profile?.estimatedTableHeight.value?.toFixed(4) ?? "—"} m · safe{" "}
                {profile?.safeTravelHeight.value?.toFixed(4) ?? "—"} m
              </p>
            </div>
            <div>
              <h2 className="mb-2 text-sm font-semibold text-white/90">Path preview</h2>
              <PathPreview plan={plan} bounds={profile?.bounds ?? null} />
            </div>
          </div>
        ) : (
          <p className="mt-4 text-sm text-white/40">
            The timeline and path preview appear once the workspace profile is confirmed and the task inputs
            are complete.
          </p>
        )}

        {validation && (
          <div className="mt-5">
            <h2 className="mb-2 text-sm font-semibold text-white/90">Safety check</h2>
            <SafetyCheckList items={validation} />
          </div>
        )}
      </section>

      {/* 5 — Export */}
      <section id="export" className={CARD}>
        <p className={SECTION_TITLE}>5 · Export</p>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button
            onClick={runGenerate}
            disabled={!plan}
            className="rounded-full bg-cyan-500/90 px-6 py-2.5 text-sm font-semibold text-black transition-colors hover:bg-cyan-400 disabled:opacity-30"
          >
            Generate
          </button>
          <button
            onClick={downloadGenerated}
            disabled={!generated}
            className="rounded-full border border-cyan-400/50 px-5 py-2.5 text-sm font-medium text-cyan-300 transition-colors hover:bg-cyan-400/10 disabled:opacity-30"
          >
            Download Kortex JSON
          </button>
          <button
            onClick={resetAll}
            className="rounded-full border border-white/15 px-4 py-2 text-xs text-white/60 hover:border-red-400/50 hover:text-red-300"
          >
            Reset
          </button>
          {generated && (
            <label className="ml-auto flex cursor-pointer items-center gap-2 text-xs text-white/60">
              <input
                type="checkbox"
                checked={markedTested}
                onChange={(e) => setMarkedTested(e.target.checked)}
                className="h-4 w-4 accent-emerald-400"
              />
              Mark as tested on robot
            </label>
          )}
        </div>
        {generateError && (
          <p className="mt-3 rounded-lg border border-red-500/30 bg-red-500/5 px-3 py-2 text-xs text-red-200">{generateError}</p>
        )}
        {generated && (
          <div className="mt-4 flex flex-col gap-3">
            <div className="rounded-lg border border-amber-500/25 bg-amber-500/5 px-3 py-2 text-xs leading-5 text-amber-200">
              Generated from the uploaded demonstration template. Verify in Kortex before running.
            </div>
            <p className="text-xs text-white/50">
              Sequence <span className="font-mono text-cyan-300">{generated.name}</span> — {generated.plan.length}{" "}
              steps, importable via the Kortex web app&apos;s sequence import. The file contains only the new
              sequence, so importing cannot overwrite your existing ones.{" "}
              {markedTested ? (
                <span className="text-emerald-300">✓ Marked as tested on the robot.</span>
              ) : (
                <span className="text-amber-300">Not yet tested on the robot.</span>
              )}
            </p>
            <details className="rounded-xl border border-white/10 bg-black/30">
              <summary className="cursor-pointer px-4 py-2.5 text-xs font-medium text-white/60 hover:text-cyan-300">
                Preview generated JSON
              </summary>
              <pre className="max-h-80 overflow-auto px-4 pb-4 font-mono text-[11px] leading-5 text-cyan-100/80">
                {JSON.stringify(generated.file, null, 2)}
              </pre>
            </details>
          </div>
        )}
      </section>
    </main>
  );
}
