"use client";

import type { CameraSource, RobotState } from "@/lib/agent/types";

function Light({ on, warn }: { on: boolean; warn?: boolean }) {
  return (
    <span
      className={`inline-block h-2.5 w-2.5 rounded-full ${
        on ? (warn ? "bg-amber-400" : "bg-emerald-400") : "bg-red-400/80"
      } ${on ? "shadow-[0_0_6px_currentColor]" : ""}`}
    />
  );
}

export function RobotStatus({
  bridgeUrl,
  onBridgeUrlChange,
  robot,
  cameraSource,
  controlMode,
}: {
  bridgeUrl: string;
  onBridgeUrlChange: (url: string) => void;
  robot: RobotState;
  cameraSource: CameraSource;
  controlMode: string;
}) {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-[#0D1524] p-4">
      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs">
        <span className="flex items-center gap-2 text-white/70">
          <Light on={robot.online} /> Robot {robot.online ? "Online" : "Offline"}
        </span>
        <span className="flex items-center gap-2 text-white/70">
          <Light on={cameraSource !== "none"} warn={cameraSource === "uploaded-image"} /> Camera{" "}
          {cameraSource === "none" ? "Offline" : cameraSource === "webcam" ? "Online" : "Demo (image)"}
        </span>
        <span className="font-mono text-white/50">
          Control Mode: <span className="text-cyan-300">{controlMode}</span>
        </span>
        {robot.online && (
          <span className="font-mono text-white/50">
            {robot.status === "executing" && robot.currentAction
              ? `▶ ${robot.currentAction}${robot.progress !== null ? ` · ${(robot.progress * 100).toFixed(0)}%` : ""}`
              : robot.status === "paused"
                ? "⏸ Paused"
                : robot.status === "completed"
                  ? "✓ Completed"
                  : robot.status === "error"
                    ? `✗ ${robot.error ?? "Error"}`
                    : "Idle"}
          </span>
        )}
      </div>
      {robot.online && robot.status === "executing" && robot.progress !== null && (
        <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-cyan-400 transition-all"
            style={{ width: `${robot.progress * 100}%` }}
          />
        </div>
      )}
      <div className="flex items-center gap-2">
        <label className="shrink-0 text-[11px] text-white/40">Robot Bridge URL</label>
        <input
          value={bridgeUrl}
          onChange={(e) => onBridgeUrlChange(e.target.value)}
          spellCheck={false}
          className="w-full max-w-xs rounded-lg border border-white/10 bg-black/40 px-2.5 py-1.5 font-mono text-xs text-white/80 outline-none focus:border-cyan-400/60"
        />
      </div>
    </div>
  );
}
