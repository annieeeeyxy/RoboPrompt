# RoboCoder — Architecture, Build Plan & Test Plan

> Companion to `docs/PROJECT.md` (the pitch) and `docs/agent/robot-arm-agent.md`
> (the agent's system prompt). This document is the technical design: how the
> two arm categories fork the pipeline, the data model, the API surface, and
> the phased plan to build and test it. Nothing in this document has been
> implemented yet — it's the spec the next implementation phase follows.

---

## 1. System diagram

`docs/PROJECT.md` describes a 6-step pipeline (Perception → Matching → Gap
Detection → Goal Capture → Prompt Builder → Code Generation). This document
extends it with an explicit category fork right after Perception:

```
┌─────────────┐
│   Upload    │  Image / CAD / design file
└──────┬──────┘
       ▼
┌──────────────────────┐
│  1. Perception       │  Vision call to Claude. Output: draft RobotAnalysis
│                      │  (see §2) + a proposed RobotCategory.
└──────┬───────────────┘
       ▼
┌──────────────────────┐
│  2. Classify & fork  │  Confirm category with user (per agent spec §1).
└──────┬───────────────┘
       │
   ┌───┴────────────────────┐
   ▼                        ▼
┌─────────────────┐   ┌─────────────────────────┐
│ Category A path  │   │ Category B path          │
│ servo/MCU        │   │ brushless/reducer, ROS2  │
│                  │   │ Brand/SDK lookup FIRST   │
└──────┬───────────┘   └──────┬──────────────────┘
       │                      │
       ▼                      ▼
┌──────────────────────────────────────┐
│  3. Gap Detection (per-category      │  Uses docs/agent/robot-arm-agent.md
│     question flow, §2A/§2B of spec)  │  as the system prompt for the whole
└──────┬────────────────────────────────┘  conversational loop.
       ▼
┌──────────────────────┐
│  4. Goal Capture     │  End-effector pose control is default for both;
│                      │  Category B also offers path record/playback.
└──────┬───────────────┘
       ▼
┌──────────────────────┐
│  5. Architecture     │  Plain-language summary + assumptions list,
│     Summary (confirm)│  presented to the user before any generation.
└──────┬───────────────┘
       ▼
┌──────────────────────┐
│  6. Generation       │  Category-specific templates/scaffolding
│                      │  (firmware+host app, or ROS2/MoveIt2 config).
└──────┬───────────────┘
       ▼
┌──────────────────────┐
│  Output              │  Code + config + safety notes + calibration steps
│                      │  + a generated web control panel (pose control,
│                      │  and path record/playback for Category B).
└──────────────────────┘
```

**Key design rule (unchanged from PROJECT.md):** never jump from "image" to
"code." Perception → classify → gap-check → goal → summary → generate.

---

## 2. Data model (sketch for next implementation phase)

`my-app/src/lib/types.ts` currently models a single-shot analysis with no
category fork and no multi-turn conversation state. It is **not modified in
this phase** — the following is the target shape for the implementation phase
that follows this doc:

```ts
// Category fork. Named "industrial", not "industrial_ros2" — Category B now
// covers both the Jetson/ROS2 flavor and the FRC-style roboRIO/WPILib flavor
// (see docs/agent/robot-arm-agent.md §1/§2B), so the value shouldn't imply
// ROS2 is the only option.
export type RobotCategory = "servo_mcu" | "industrial";

// Category A hardware
export interface ServoMcuHardware {
  category: "servo_mcu";
  actuatorType: "pwm_hobby_servo" | "serial_bus_servo";
  servoBus?: "dynamixel" | "feetech" | "hiwonder" | "other";
  controlBoard: "arduino" | "esp32" | "stm32" | "pico" | "pca9685" | "other";
  hostConnection: "usb_serial" | "wifi" | "bluetooth";
  firmwareLanguage: "arduino_cpp" | "micropython" | "circuitpython";
  hostLanguage: "python" | "node" | "other";
}

// Category B hardware — two control-stack sub-flavors, one category
export interface IndustrialHardware {
  category: "industrial";
  controlStack: "ros2" | "wpilib" | "other";
  brand?: string;           // matched against the known-SDK table, if any
  sdkMatch?: SdkMatch;
  jointBus: "can" | "ethercat" | "rs485" | "proprietary" | "unknown";
  sameMachineForPanel?: boolean;

  // ros2 flavor
  compute?: "jetson_orin" | "jetson_xavier" | "jetson_nano" | "other_pc";
  jetpackVersion?: string;
  ros2Distro?: "humble" | "iron" | "jazzy" | "other";
  ros2Installed?: boolean;
  hasMoveitConfig?: boolean;
  hasRos2ControlHw?: boolean;

  // wpilib flavor
  wpilibYear?: string;
  wpilibLanguage?: "java" | "cpp" | "python";
  vendorLibs?: ("revlib" | "phoenix5" | "phoenix6" | "pathplanner")[];
}

export type HardwareInfo = ServoMcuHardware | IndustrialHardware;

// Brand/SDK lookup table entry (docs/agent/robot-arm-agent.md §2B table,
// mirrored here so the app can match programmatically). Treat the static
// table as a cache, not ground truth — verify against upstream before
// hardcoding a package name into generated code (see §4 build plan, phase 4).
export interface SdkMatch {
  brand: string;
  family?: string;          // e.g. "UR3/5/10/16, e-Series"
  integrationPackage?: string; // e.g. "ur_robot_driver" or "REVLib"
  controlStack: "ros2" | "wpilib";
  hasOfficialSdk: boolean;
}

// Multi-turn conversation state (current types.ts has no conversation model —
// RobotAnalysis is a one-shot result, not a running Q&A session). The client
// round-trips the full ConversationState on every /api/session call (see §3)
// — no server-side session store for now.
export interface ConversationState {
  sessionId: string;
  category?: RobotCategory;
  categoryConfirmed: boolean;
  analysis: RobotAnalysis;          // existing type, reused as-is
  pendingQuestions: Question[];     // existing type, reused as-is
  answers: Record<string, string>;
  hardware?: HardwareInfo;
  // Optional emphasis, not a gate: the category's deliverable bundle (§4 of
  // the agent spec) is generated by default regardless of goal — e.g.
  // Category B always gets pose control AND record/playback together. `goal`
  // just tells the summary/generation step what to foreground, and lets the
  // user ask for a narrower scope (e.g. just gripper control) if they want
  // less than the full default bundle.
  goal?: ControlGoal;               // existing type, extend with "record_path" / "play_path"
  summaryConfirmed: boolean;
}
```

Notes:
- `RobotAnalysis` and `Question` already exist in `types.ts` and are reused
  as-is. `ControlGoal` already exists too, gains `"record_path"` and
  `"play_path"` variants, and changes meaning slightly per the comment above —
  it's an emphasis/narrowing signal, not the sole trigger for what gets built.
- `GeneratedCode.code`/`.language` (existing single-file fields) don't fit
  either category — both always produce multiple files (firmware/host-bridge/
  web-UI for A; driver-config/launch-files/web-panel for B). Replace them with
  a `files: {path: string; content: string}[]` array as the primary output.
  Nothing in the app consumes `code`/`.language` yet (no codegen exists), so
  this is a clean replacement, not an additive change.
- Add `buildPlan: string[]` and `testPlan: string[]` to `GeneratedCode`,
  matching the agent spec's §4 requirement that every generated deliverable
  include a hardware-specific build plan and test plan. The existing
  `calibrationSteps` field is folded into `buildPlan` per that same section —
  drop `calibrationSteps` as a separate field rather than keeping both.

---

## 3. API surface (sketch)

Building on Person D's ownership of `src/app/api/*` (per `docs/PROJECT.md` §6):

- **`POST /api/analyze`** — accepts the uploaded image, calls Claude's vision
  API, returns a draft `RobotAnalysis` + proposed `RobotCategory`. No
  conversation state yet. Accepts a single image per call, JPEG/PNG/WebP,
  capped at a few MB (resize client-side before upload if larger — exact
  limit to be set from Claude's vision input limits when this is built).
- **`POST /api/session`** — the multi-turn Q&A loop. Takes the **full**
  `ConversationState` + the user's latest message/answers, calls Claude with
  `docs/agent/robot-arm-agent.md` loaded verbatim as the system prompt, and
  returns the updated `ConversationState` (with the model's next batch of
  questions, or, once ready, the architecture summary) back to the caller.
  **State lives entirely on the client** for now — the route is stateless and
  round-trips whatever it's given; no server-side session store. Revisit this
  once the app has real user accounts (see open questions §6). **
  `robot-arm-agent.md` is read from disk at request time (or cached in memory
  with a file-watch in dev) — it is never copied into TypeScript source, so
  editing the spec doesn't require a code change.**
- **`POST /api/generate`** — takes a confirmed `ConversationState`, produces
  the final `GeneratedCode` (firmware/host app for Category A; ROS2/MoveIt2
  or WPILib scaffolding for Category B), including the generated web control
  panel source, build plan, and test plan (per the agent spec's §4).

`ANTHROPIC_API_KEY` is read from the environment (`.env.local`, gitignored).
Until a key is available, `/api/analyze` and `/api/session` should return
fixture/mock responses behind an `if (!process.env.ANTHROPIC_API_KEY)` check
so the frontend flow can be built and demoed without live API access.

Note on naming drift from `docs/PROJECT.md`: that doc's step 5 ("Prompt
Builder") is not a separate code module here — `/api/session` calling Claude
with the agent markdown as system prompt plus the running conversation *is*
the structured prompt. Don't build a separate prompt-assembly step; the two
things collapse into one.

---

## 4. Phased build plan

Roadmap for implementation sessions after this doc. Each phase should be
demoable on its own.

1. **Types** — update `my-app/src/lib/types.ts` per §2 above.
2. **API skeletons** — `/api/analyze`, `/api/session`, `/api/generate` with
   mocked Claude responses; wire the `ANTHROPIC_API_KEY` env var gate.
3. **Frontend flow** — upload page → chat-style gap-filling UI → architecture
   summary/confirmation screen → generated-output viewer (syntax-highlighted
   code blocks, per-file download, plain-language summary panel). Keep it
   simple and legible — this is the user-facing payoff, so the output view
   should visually separate "what we understood," "what we assumed," and "what
   we generated," not just dump a wall of code.
4. **Category-specific generation logic**:
   - Category A: firmware + host-bridge + web-panel templates.
   - Category B: brand/SDK lookup table (§2's `SdkMatch`) + ROS2/MoveIt2
     scaffolding + a live web search step (for brands not in the static table)
     before falling back to the custom-build question flow.
5. **Live Claude wiring** — replace mocks with real API calls once
   `ANTHROPIC_API_KEY` is available; smoke-test both category paths end-to-end.
6. **Polish & deploy** — UI pass, then deploy (Vercel, per PROJECT.md's open
   question).

---

## 5. Test plan

- **Unit tests** (deterministic logic only — no live model calls):
  - Gap-detection: given a partial `ConversationState`, the correct set of
    missing-field questions is produced for each category (both control-stack
    sub-flavors for Category B).
  - SDK lookup-table matching: brand/model strings resolve to the right
    `SdkMatch` entry (or `undefined` for unknown brands).
- **Golden-sample QA set**: curate ~6–10 sample arm photos — a few clearly
  Category A (e.g. a Hiwonder/uArm-style kit), a few clearly Category B (e.g. a
  UR or AR4-style arm), and 1–2 deliberately ambiguous ones. Re-run this set
  by hand any time `docs/agent/robot-arm-agent.md` changes, and check:
  classification is right (or the agent asks instead of guessing), and the
  question batch is minimal and relevant.
- **Manual end-to-end run**: walk the full demo flow from `docs/PROJECT.md`
  §7 (upload → describe → 2 questions → code) before any presentation.
- **Generated-code safety checklist** — run against every code-gen output
  before showing it to a user:
  - [ ] Joint angle/position limits present.
  - [ ] Speed/torque caps present (conservative defaults if unspecified).
  - [ ] An E-Stop path exists and is documented.
  - [ ] Every assumed (non-user-confirmed) value is flagged in the output.

---

## 6. Open questions (carried from PROJECT.md, still unresolved)

- Deployment target (Vercel / Netlify / Railway) — not yet decided.
- Whether Category B's web panel talks to ROS 2 via `rosbridge_suite` or a
  custom FastAPI+WebSocket bridge — deferred to phase 4, decide once a first
  real ROS2 target arm is chosen for testing.
- **Auth**: `my-app/src/app/login/*` already has sign-in/sign-up screens, but
  nothing in this doc ties RoboCoder sessions to a logged-in user yet. Decide
  whether `/api/session` and `/api/generate` require auth (and if so, whether
  `ConversationState` should move to server-side storage keyed by user at that
  point, superseding the client-round-trip approach in §3) before or during
  phase 3.
- **Image retention**: uploaded arm photos currently aren't specified to be
  stored anywhere — decide whether they're forwarded to Claude and discarded,
  or persisted (e.g. for the golden-sample QA set in §5), especially given
  likely student users.
