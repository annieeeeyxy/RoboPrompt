import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Kinova Pick & Place — RoboPrompt",
  description:
    "Turn one verified Kinova Kortex demonstration into reusable, editable pick-and-place automation.",
};

export default function KinovaLayout({ children }: { children: React.ReactNode }) {
  return children;
}
