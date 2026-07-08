const CATEGORIES = [
  {
    name: "Category A — Small, servo/microcontroller-driven",
    body:
      "Plastic or 3D-printed arms driven by hobby servos, smart bus servos, steppers, or small DC motors, controlled through a microcontroller (Arduino, ESP32, STM32, Pico). RoboPrompt's target deliverable here is a browser-based control panel over Web Serial or Web Bluetooth — no native host app required.",
  },
  {
    name: "Category B — Large, brushless motors + reducers",
    body:
      "Metal-bodied arms with harmonic-drive or planetary-gearbox joints, usually paired with a Jetson or industrial PC running ROS2. RoboPrompt tries to identify the brand/model first and points you at the matching vendor SDK or ROS2 driver before falling back to a full custom-build question flow.",
  },
];

export default function AboutPage() {
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-10 px-4 py-16">
      <section>
        <h1 className="text-2xl font-semibold">About RoboPrompt</h1>
        <p className="mt-3 text-black/60 dark:text-white/60">
          RoboPrompt is an AI assistant for designing robotic arm control systems.
          Most people who build or buy a robot arm can get the hardware working, but
          turning that into a real control system — firmware, drivers, a web panel —
          is where things stall. RoboPrompt closes that gap: upload a photo, answer a
          short set of targeted questions, and get an architecture, build plan, and
          test plan specific to your hardware.
        </p>
      </section>

      <section>
        <h2 className="font-medium">How it works</h2>
        <p className="mt-2 text-sm text-black/60 dark:text-white/60">
          RoboPrompt never jumps straight from a photo to code. It always works
          through the same sequence: understand the image, classify the arm, ask only
          for what it couldn&apos;t determine itself, summarize its understanding and
          assumptions back to you, and only then generate the final plan.
        </p>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="font-medium">Two categories, one pipeline</h2>
        {CATEGORIES.map((category) => (
          <div
            key={category.name}
            className="rounded-2xl border border-black/10 p-5 dark:border-white/10"
          >
            <h3 className="text-sm font-semibold">{category.name}</h3>
            <p className="mt-2 text-sm text-black/60 dark:text-white/60">{category.body}</p>
          </div>
        ))}
      </section>
    </main>
  );
}
