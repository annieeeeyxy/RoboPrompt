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
