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

const PIPELINE_STEPS = [
  {
    title: "1. Vision analysis",
    body: "Read the photo for logo/brand/model, joint count and DOF, motor or servo clues, controller board, and overall size and structure.",
  },
  {
    title: "2. Known model, or not?",
    body: "If the hardware matches a known product or open-source design, go straight to its official docs, SDK, or ROS/MoveIt package. If not, ask the user directly — motor type, controller, protocol, wiring, joint limits, control goal.",
  },
  {
    title: "3. Classify & choose a control path",
    body: "Arduino servo arm, ESP32 web robot, ROS/open-source arm, or industrial robot arm — each maps to a different control path: Arduino/ESP32 firmware, a vendor SDK, or ROS/MoveIt over serial or CAN.",
  },
  {
    title: "4. Final output",
    body: "Runnable control code, wiring and setup steps, and a calibration + test plan — not just a code snippet.",
  },
];

const EXAMPLES = [
  {
    type: "Arduino servo arm",
    ask: "Servo pins, angle range, zero position",
    generated: "Arduino control code",
  },
  {
    type: "ESP32 robotic arm",
    ask: "Wi-Fi, servo pins, control mode",
    generated: "Web control interface",
  },
  {
    type: "ROS robot arm",
    ask: "Joints, URDF, MoveIt support",
    generated: "ROS node / motion planning",
  },
  {
    type: "Industrial arm",
    ask: "Brand, SDK, protocol",
    generated: "Official SDK-based code",
  },
  {
    type: "Unknown / custom robot",
    ask: "Motor type, controller, connection",
    generated: "Diagnosis + template code",
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
        <h2 className="font-medium">The problem</h2>
        <p className="mt-2 text-sm text-black/60 dark:text-white/60">
          Robot programming is hard because the mechanical structure, hardware
          information, communication protocol, and code are usually disconnected. A
          photo alone isn&apos;t enough to generate reliable code — different robots
          use different motors, servos, controllers, SDKs, or ROS packages, and
          beginners often don&apos;t know what information is even needed before they
          can start coding. Generic AI coding tools can write code, but they don&apos;t
          have robotics context: they guess instead of asking.
        </p>
      </section>

      <section>
        <h2 className="font-medium">Core rule</h2>
        <p className="mt-2 text-sm text-black/60 dark:text-white/60">
          Never let the AI guess robot code directly. Identify the hardware first,
          then ask for whatever is still missing — in that order, every time.
        </p>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="font-medium">How it works</h2>
        <ol className="grid gap-4 sm:grid-cols-2">
          {PIPELINE_STEPS.map((step) => (
            <li
              key={step.title}
              className="rounded-2xl border border-black/10 p-5 dark:border-white/10"
            >
              <h3 className="text-sm font-semibold">{step.title}</h3>
              <p className="mt-2 text-sm text-black/60 dark:text-white/60">{step.body}</p>
            </li>
          ))}
        </ol>
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

      <section>
        <h2 className="font-medium">A few examples</h2>
        <div className="mt-3 overflow-x-auto rounded-2xl border border-black/10 dark:border-white/10">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-black/10 dark:border-white/10">
                <th className="px-4 py-3 font-semibold">Robot type</th>
                <th className="px-4 py-3 font-semibold">What we ask</th>
                <th className="px-4 py-3 font-semibold">What we generate</th>
              </tr>
            </thead>
            <tbody>
              {EXAMPLES.map((row, i) => (
                <tr
                  key={row.type}
                  className={i < EXAMPLES.length - 1 ? "border-b border-black/10 dark:border-white/10" : ""}
                >
                  <td className="px-4 py-3 text-black/80 dark:text-white/80">{row.type}</td>
                  <td className="px-4 py-3 text-black/60 dark:text-white/60">{row.ask}</td>
                  <td className="px-4 py-3 text-black/60 dark:text-white/60">{row.generated}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2 className="font-medium">Inspiration</h2>
        <p className="mt-2 text-sm text-black/60 dark:text-white/60">
          RoboPrompt builds on two lines of research: {" "}
          <span className="font-medium text-black/80 dark:text-white/80">
            Code as Policies
          </span>{" "}
          shows that language models can generate not just conversation or plans but
          executable robot control programs directly from natural-language commands.{" "}
          <span className="font-medium text-black/80 dark:text-white/80">RoboCodeX</span>{" "}
          extends this to a multimodal setting — using visual observations, depth
          information, and human instructions to generate executable robot behavior
          code for motion planning and control. RoboPrompt applies the same idea to a
          more concrete, hardware-first workflow: identify the robot first, then
          generate code for exactly the hardware in front of you.
        </p>
      </section>
    </main>
  );
}
