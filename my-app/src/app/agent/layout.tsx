import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Robot Agent — RoboPrompt",
  description: "Language-guided robot control built on verified motion skills.",
};

export default function AgentLayout({ children }: { children: React.ReactNode }) {
  return children;
}
