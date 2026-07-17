"""RoboPrompt Robot Bridge — reference stub (SIMULATION ONLY).

Implements the HTTP interface the RoboPrompt web app's Robot Agent page
expects, with a fake robot that "executes" plans by walking through the
steps on a timer. No hardware is touched. Replace the `FakeRobot` class
with calls into the Kortex Python API (kortex_api / kortex_driver) or a
ROS 2 action client to drive a real arm — the HTTP surface stays the same.

Run:
    pip install fastapi uvicorn
    uvicorn bridge_stub:app --port 8000

The web app reads NEXT_PUBLIC_ROBOT_BRIDGE_URL (default http://localhost:8000)
or the URL typed into the Robot Agent page.
"""

import asyncio
import threading
import time

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI(title="RoboPrompt Robot Bridge (simulation)")

# The browser calls the bridge directly; allow the web app's origins.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://robo-prompt.vercel.app"],
    allow_methods=["*"],
    allow_headers=["*"],
)


class FakeRobot:
    """Simulated arm: replace with Kortex API / ROS 2 calls for real use."""

    def __init__(self) -> None:
        self.lock = threading.Lock()
        self.status = "idle"  # idle | executing | paused | completed | error
        self.current_action: str | None = None
        self.progress: float | None = None
        self._abort = False
        self._pause = False

    def state(self) -> dict:
        with self.lock:
            return {
                "online": True,
                "status": self.status,
                "currentAction": self.current_action,
                "progress": self.progress,
                "error": None,
            }

    def execute(self, steps: list[dict]) -> None:
        with self.lock:
            if self.status == "executing":
                raise RuntimeError("already executing")
            self.status = "executing"
            self._abort = False
            self._pause = False
        threading.Thread(target=self._run, args=(steps,), daemon=True).start()

    def _run(self, steps: list[dict]) -> None:
        total = max(len(steps), 1)
        for i, step in enumerate(steps):
            while True:
                with self.lock:
                    if self._abort:
                        self.status = "idle"
                        self.current_action = None
                        self.progress = None
                        return
                    paused = self._pause
                    if not paused:
                        self.current_action = step.get("type", f"step {i + 1}")
                        self.progress = i / total
                        self.status = "executing"
                    else:
                        self.status = "paused"
                if not paused:
                    break
                time.sleep(0.2)
            time.sleep(1.0)  # simulated motion time per step
        with self.lock:
            self.status = "completed"
            self.current_action = None
            self.progress = 1.0

    def pause(self) -> None:
        with self.lock:
            self._pause = not self._pause

    def stop(self) -> None:
        with self.lock:
            self._abort = True
            self._pause = False


robot = FakeRobot()


class Plan(BaseModel):
    taskName: str
    objectName: str
    steps: list[dict]
    speedLevel: str
    kortexSequence: dict | None = None


@app.get("/health")
def health() -> dict:
    return {"ok": True, "mode": "simulation"}


@app.get("/robot/state")
def robot_state() -> dict:
    return robot.state()


@app.get("/camera/status")
def camera_status() -> dict:
    return {"connected": False, "depth": False}


@app.get("/camera/frame")
def camera_frame() -> dict:
    return {"error": "no camera attached to the simulation bridge"}


@app.post("/vision/detect")
def vision_detect() -> dict:
    return {"objects": [], "note": "simulation bridge has no camera; use the web app's detection"}


@app.post("/task/preview")
def task_preview(plan: Plan) -> dict:
    issues = []
    if len(plan.steps) != 9:
        issues.append({"level": "warning", "message": f"Expected 9 steps, got {len(plan.steps)}"})
    return {"ok": not issues, "items": issues}


@app.post("/task/execute")
async def task_execute(plan: Plan) -> dict:
    await asyncio.to_thread(robot.execute, plan.steps)
    return {"accepted": True, "taskName": plan.taskName}


@app.post("/task/pause")
def task_pause() -> dict:
    robot.pause()
    return {"ok": True}


@app.post("/robot/stop")
def robot_stop() -> dict:
    robot.stop()
    return {"ok": True}
