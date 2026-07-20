# RoboPrompt Web App

RoboPrompt is a Next.js app that turns a robot-arm photo into an interview,
then a concrete control plan, then an optional downloadable code scaffold.

## Requirements

- Node.js 22+
- pnpm 10+

## Environment

Copy `.env.example` to `.env.local` and set:

- `ANTHROPIC_API_KEY`: required for model calls
- `SITE_PASSWORD`: required in production; protects paid API usage

```bash
cp .env.example .env.local
```

## Install

```bash
pnpm install
```

## Run Locally

```bash
pnpm dev
```

Open `http://localhost:3000/prompt`.

## Scripts

- `pnpm dev`: start local dev server
- `pnpm typecheck`: run TypeScript checks
- `pnpm lint`: run ESLint
- `pnpm test`: run unit tests
- `pnpm build`: production build
- `pnpm start`: run production server

## Quality Gate

Local pre-merge check:

```bash
pnpm typecheck && pnpm lint && pnpm test && pnpm build
```

CI runs the same checks on pushes and pull requests to `main`.

## Security Notes

- Auth cookie is `HttpOnly`, `Secure`, `SameSite=Lax`.
- Login redirect is restricted to internal paths only.
- Uploads have image/reference size caps.
- ZIP extraction applies decompression and path safety guards.

## Deployment

Primary target: Vercel.

1. Import the repository in Vercel.
2. Set `ANTHROPIC_API_KEY` and `SITE_PASSWORD`.
3. Deploy from `main`.

Set `my-app` as the Vercel project Root Directory. This project uses the fixed `/prompt` base path; RoboLab Hub proxies `https://robo-labs.net/prompt/*` to this independent deployment.

If deploying elsewhere, ensure support for Next.js App Router and Node.js runtime API routes.
