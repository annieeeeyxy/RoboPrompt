import type { MotionPlan, RobotAdapter, RobotState, ValidationResult } from "./types";

export const DEFAULT_BRIDGE_URL =
  process.env.NEXT_PUBLIC_ROBOT_BRIDGE_URL ?? "http://localhost:8000";

const OFFLINE_STATE: RobotState = {
  online: false,
  currentAction: null,
  progress: null,
  status: "unknown",
  error: null,
};

/**
 * HTTP client for the local Python Robot Bridge. The browser talks to the
 * bridge directly (it runs on the operator's machine next to the arm) — the
 * cloud app never connects to the Kinova itself. Every call is best-effort:
 * an unreachable bridge reports offline instead of throwing into the UI.
 */
export class RobotBridgeClient implements RobotAdapter {
  constructor(private baseUrl: string = DEFAULT_BRIDGE_URL) {}

  private async request<T>(path: string, init?: RequestInit): Promise<T> {
    const res = await fetch(`${this.baseUrl}${path}`, {
      ...init,
      headers: { "Content-Type": "application/json", ...init?.headers },
      signal: AbortSignal.timeout(4000),
    });
    if (!res.ok) throw new Error(`${path} → HTTP ${res.status}`);
    return (await res.json()) as T;
  }

  async connect(): Promise<void> {
    await this.request("/health");
  }

  async isOnline(): Promise<boolean> {
    try {
      await this.request("/health");
      return true;
    } catch {
      return false;
    }
  }

  async getState(): Promise<RobotState> {
    try {
      const raw = await this.request<Partial<RobotState>>("/robot/state");
      return {
        online: true,
        currentAction: raw.currentAction ?? null,
        progress: typeof raw.progress === "number" ? raw.progress : null,
        status: raw.status ?? "idle",
        error: raw.error ?? null,
      };
    } catch {
      return OFFLINE_STATE;
    }
  }

  async getCameraStatus(): Promise<{ connected: boolean; depth: boolean }> {
    try {
      return await this.request("/camera/status");
    } catch {
      return { connected: false, depth: false };
    }
  }

  preview(plan: MotionPlan): Promise<ValidationResult> {
    return this.request("/task/preview", { method: "POST", body: JSON.stringify(plan) });
  }

  async execute(plan: MotionPlan): Promise<void> {
    await this.request("/task/execute", { method: "POST", body: JSON.stringify(plan) });
  }

  async pause(): Promise<void> {
    await this.request("/task/pause", { method: "POST" });
  }

  async stop(): Promise<void> {
    await this.request("/robot/stop", { method: "POST" });
  }
}
