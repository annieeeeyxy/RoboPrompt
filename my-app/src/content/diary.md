# Project Diary

A running log of what happened on RoboPrompt, day by day.

## 2026-07-02

- Set up the initial Next.js project skeleton and added the first README.

## 2026-07-06

- Small README tweak.

## 2026-07-08

- Committed early design docs — an architecture doc, a project pitch, a
  draft agent system prompt, and initial data types for a robot-arm
  classification system. (These were later replaced — see below.)
- Cleaned up the README's naming and team-project leftovers.
- Clarified RoboPrompt's actual scope: an AI assistant that turns a photo
  of a robotic arm into a working control plan — unrelated to the earlier
  FTC/robotics-coaching framing some of the old docs implied.
- Rebuilt from scratch on a clean slate: a fresh system prompt for the
  agent, streaming `/api/classify` and `/api/chat` routes, an image
  upload + compression pipeline, a chat interview UI, and a rendered
  plan view.
- Restructured the site into a proper multi-page project site — Home,
  About, Members, and Try it (the tool) — instead of a bare chat box.
- Enriched the About page with content pulled from the original pitch
  deck: the problem statement, the pipeline diagram, a worked example
  table, and research references.
- Added a profile photo to the Members page.
- Deployed to Vercel at robo-prompt.vercel.app.
- Added this project diary page, seeded from git history.
- Added Dora Ai to the Members page.
- Added a commit-activity chart to the diary page.
- Turned each Members card into its own profile page (`/members/[slug]`)
  with GitHub and email links and a WeChat QR code.
- Redesigned the home page: bigger hero with a background glow, icon-based
  step cards, a "Built for any robot arm" section, and a closing CTA.
- Fixed a 500 error on photo upload in production — `sharp`'s native binary
  wasn't bundled correctly for Vercel; fixed via `serverExternalPackages`.
- Added support for uploading multiple photos of the same arm at once.
- Removed the WeChat QR code from Annie's Members profile page.
- Tracked down the real cause of the upload 500: pnpm's default symlinked
  node_modules layout broke Vercel's deployment packaging, and a version
  mismatch between our `sharp` and Next's own internal `sharp` created a
  libvips conflict. Fixed by switching to `nodeLinker: hoisted` and aligning
  our sharp version to Next's (0.34.5) — upload works in production now.
- Reworked the `/try` interview flow from a free-text chat into an actual
  form: the agent now calls a structured `ask_form` tool (short prompt +
  typed fields — text/select/textarea) instead of writing prose questions,
  and the frontend renders real form fields instead of chat bubbles. Kept
  the final plan as a streamed markdown document. Verified the full
  classify → gap-fill form → summary form → plan flow via the live API.
- Fixed two blank/black-screen gaps during waits (upload analysis and form
  submission) by adding a proper loading indicator, and made the final plan
  stream in live instead of staying hidden behind the spinner.

## 2026-07-09 (overnight batch, self-tested while Annie slept)

- Fixed the select-dropdown dark-mode contrast bug (unreadable light-on-light
  text) and added an "Other (type my own)" escape hatch to every select
  field so users aren't limited to the given options.
- Added a password gate: `SITE_PASSWORD` env var, `/api/auth`,
  `src/middleware.ts`, `/login` page. Protects `/try` and every API route
  that spends tokens. Fails closed in production if the env var isn't set —
  confirmed the deployed site is currently fully locked until it's added in
  Vercel.
- Deepened the system prompt: brand-first SDK detection now applies to
  small kits too (uArm, Hiwonder, Braccio), not just industrial arms, and
  Category B's question flow gained a second, deeper group (payload/torque
  limits, network topology, MoveIt2/ros2_control status, simulation
  environment) so the final plan can include real integration code.
- Added reference-file upload at intake: users can attach URDF/xacro,
  datasheets, existing code, or a zip of their project alongside the photo,
  each with an optional description. Zips get their text-readable entries
  extracted; PDFs go through Claude's native document support; anything
  else keeps its filename/description as context.
- Found and fixed a real crash while testing the above: sending a larger
  request exposed a race where the SSE response's stream controller gets
  closed by the runtime on client disconnect, independent of the app's own
  state tracking — hardened `lib/sse.ts` against it.
- Added a "Download code (.zip)" option on the confirmed plan: forces a
  `generate_files` tool call, packages the result into a real zip via
  `jszip`. Had to raise the token budget and switch to the streaming API
  internally after finding the non-streaming call gets rejected outright
  at that budget ("streaming required for operations that may take longer
  than 10 minutes"). Verified by actually unzipping the output — real,
  working Arduino firmware + a matching Web Serial control panel + a
  Python bridge + a honest SETUP.md, not placeholder code.
- Full regression pass: typecheck, lint, build, and a local end-to-end
  smoke test all clean. Production verification is on hold until
  `SITE_PASSWORD` is set in Vercel (expected — that's the fail-closed
  default doing its job).
- Annie set `SITE_PASSWORD` in Vercel and redeployed — confirmed working
  end-to-end in production.
- Self-tested the full flow on production with a real photo Annie sent (a
  LeArm-style 5-DOF hobby-servo kit): brand-first detection correctly
  named the LewanSoul/Hiwonder LeArm family from the photo alone, walked
  through the interview (Arduino Uno, standard 180° servos, as Annie
  specified), reached a confirmed plan, and generated a real code zip.
  Unzipped and read the actual output — genuine working Arduino firmware,
  a matching Web Serial control panel with real inverse-kinematics math,
  and a README, not placeholders. Found and fixed one real bug in the
  process: the generated SETUP.md had a literal backslash-n instead of
  line breaks (a quirk in the model's free-text notes field, not the
  code files) — normalized in `lib/zip.ts`.
