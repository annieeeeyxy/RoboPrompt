"use client";

import { useTranslation } from "@/hooks/useTranslation";

export default function AboutPage() {
  const { t } = useTranslation();

  const CATEGORIES = [
    {
      name: t("categoryA"),
      body: t("categoryADesc"),
    },
    {
      name: t("categoryB"),
      body: t("categoryBDesc"),
    },
  ];
  console.log(CATEGORIES);

  const PIPELINE_STEPS = [
    {
      title: t("visionAnalysis"),
      body: t("visionAnalysisDesc"),
    },
    {
      title: t("knownModel"),
      body: t("knownModelDesc"),
    },
    {
      title: t("classifyPath"),
      body: t("classifyPathDesc"),
    },
    {
      title: t("finalOutput"),
      body: t("finalOutputDesc"),
    },
  ];

  const EXAMPLES = [
    {
      type: t("arduinoServoArm"),
      ask: t("servoPinsAngle"),
      generated: t("arduinoControlCode"),
    },
    {
      type: t("esp32RoboticArm"),
      ask: t("wiFiServo"),
      generated: t("webControlInterface"),
    },
    {
      type: t("rosRobotArm"),
      ask: t("jointsURDF"),
      generated: t("rosNodeMotion"),
    },
    {
      type: t("industrialArm"),
      ask: t("brandSDKProtocol"),
      generated: t("officialSDKCode"),
    },
    {
      type: t("unknownCustom"),
      ask: t("motorTypeController"),
      generated: t("diagnosisTemplate"),
    },
  ];

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-10 px-4 py-16">
      <section>
        <h1 className="text-2xl font-semibold">{t("aboutRoboPrompt")}</h1>
        <p className="mt-3 text-black/60 dark:text-white/60">{t("aboutDesc")}</p>
      </section>

      <section>
        <h2 className="font-medium">{t("problem")}</h2>
        <p className="mt-2 text-sm text-black/60 dark:text-white/60">{t("problemDesc")}</p>
      </section>

      <section>
        <h2 className="font-medium">{t("coreRule")}</h2>
        <p className="mt-2 text-sm text-black/60 dark:text-white/60">{t("coreRuleDesc")}</p>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="font-medium">{t("howItWorks2")}</h2>
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
        <h2 className="font-medium">{t("twoCategoriesOnePipeline")}</h2>
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
        <h2 className="font-medium">{t("examples")}</h2>
        <div className="mt-3 overflow-x-auto rounded-2xl border border-black/10 dark:border-white/10">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-black/10 dark:border-white/10">
                <th className="px-4 py-3 font-semibold">{t("robotType")}</th>
                <th className="px-4 py-3 font-semibold">{t("whatWeAsk")}</th>
                <th className="px-4 py-3 font-semibold">{t("whatWeGenerate")}</th>
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
    </main>
  );
}
