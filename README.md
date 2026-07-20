# RoboPrompt

> RoboPrompt turns a photo of a robotic arm into a working control plan.

## Overview
RoboPrompt is an AI assistant for designing robotic arm control systems. Upload
a photo of a robot arm, and it analyzes the hardware, classifies the arm
(small servo/microcontroller-driven vs. large brushless+reducer/ROS2-class),
asks only the follow-up questions it can't answer from the image, and
produces an architecture + build plan + test plan for controlling that arm's
end-effector — including a generated web control panel.

## Getting Started
### How to use GIT
https://rogerdudler.github.io/git-guide/
### Prerequisites
- `node.js` installed (Node 18+)
- `pnpm` installed globally:
  ```bash
  npm install -g pnpm
  ```
- Optional but helpful: Visual Studio Code

### Clone and open the repo

If you do not already have the repository locally:
```bash
git clone https://github.com/annieeeeyxy/RoboPrompt.git
cd RoboPrompt
```
If you already have the project folder, just open it in your terminal and continue.

### Install dependencies
```bash
cd my-app
pnpm install
```

### Set up your Anthropic API key
Copy `.env.example` to `.env.local` and set `ANTHROPIC_API_KEY` (get one at
https://console.anthropic.com/settings/keys).
```bash
cp .env.example .env.local
```

### Start dev server
```bash
pnpm run dev
```

### Open the dev server
Visit `http://localhost:3000/prompt` in your browser.

### Helpful checks
- Verify Node is installed:
  ```bash
  node -v
  ```
- Verify pnpm is installed:
  ```bash
  pnpm -v
  ```
- Open the app in VS Code:
  ```bash
  code .
  ```

## Scripts
- `pnpm run dev` — start development server
- `pnpm run build` — build production app
- `pnpm run start` — run production server
- `pnpm run lint` — run ESLint checks
- `pnpm run typecheck` — run TypeScript checks
- `pnpm run test` — run unit tests

## Deployment
Primary target: Vercel.

1. Import the repository in Vercel.
2. Set environment variables for `ANTHROPIC_API_KEY` and `SITE_PASSWORD`.
3. Deploy from `main`.

Configure `my-app` as the Vercel project Root Directory. The app uses the fixed `/prompt` base path and is presented publicly through `https://robo-labs.net/prompt` by the RoboLab Hub rewrite layer.

If you deploy on another platform, make sure Next.js App Router + Node.js runtime routes are supported.

