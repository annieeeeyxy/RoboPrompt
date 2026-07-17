import { planPickPlace } from "@/lib/kortex/generator";
import type { PickPlaceInput, WorkspaceProfile } from "@/lib/kortex/types";
import type { PolicyAdapter, RobotAction } from "./types";

/**
 * The v1 policy: a verified-skill template. It plans the standard 9-step
 * pick-and-place from user-confirmed workspace parameters and coordinates —
 * it does NOT interpret images or instructions itself (the instruction and
 * vision results are resolved upstream, with explicit user confirmation).
 *
 * This is deliberately not a VLA model; `controlModeLabel` is what the UI
 * shows so it is never misrepresented as one. A future SmolVLA/OpenVLA
 * adapter implements the same PolicyAdapter interface.
 */
export function createTemplatePolicyAdapter(
  profile: WorkspaceProfile,
  input: PickPlaceInput
): PolicyAdapter {
  return {
    controlModeLabel: "Verified Skill Template",
    predict(): Promise<RobotAction[]> {
      const plan = planPickPlace(input, profile);
      if (!plan) {
        return Promise.reject(
          new Error("Workspace profile parameters are missing or unconfirmed.")
        );
      }
      return Promise.resolve(plan);
    },
  };
}
