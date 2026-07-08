import Link from "next/link";

const STEPS = [
  {
    title: "Upload a photo",
    body: "Snap or find a photo of your robotic arm — hobby kit, custom build, or industrial arm.",
  },
  {
    title: "Answer a few questions",
    body: "RoboPrompt figures out what it can from the photo, and only asks about what it can't.",
  },
  {
    title: "Get your plan",
    body: "A concrete architecture, build plan, and test plan for controlling your arm's end-effector.",
  },
];

export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col items-center gap-16 px-4 py-16 text-center">
      <section className="flex flex-col items-center gap-5">
        <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">RoboPrompt</h1>
        <p className="max-w-xl text-lg text-black/60 dark:text-white/60">
          Turn a photo of a robotic arm into a working control plan.
        </p>
        <Link
          href="/try"
          className="mt-2 rounded-full bg-blue-600 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-blue-500"
        >
          Try it now
        </Link>
      </section>

      <section className="grid w-full gap-6 text-left sm:grid-cols-3">
        {STEPS.map((step, i) => (
          <div
            key={step.title}
            className="flex flex-col gap-2 rounded-2xl border border-black/10 p-5 dark:border-white/10"
          >
            <span className="text-xs font-medium text-black/40 dark:text-white/40">
              {String(i + 1).padStart(2, "0")}
            </span>
            <h2 className="font-medium">{step.title}</h2>
            <p className="text-sm text-black/60 dark:text-white/60">{step.body}</p>
          </div>
        ))}
      </section>

      <section className="max-w-xl text-sm text-black/60 dark:text-white/60">
        <p>
          Whether it&apos;s a small servo-driven desktop arm or a large brushless-motor
          industrial arm running ROS2, RoboPrompt asks the right questions for your
          hardware and generates a plan you can actually build from.
        </p>
      </section>
    </main>
  );
}
