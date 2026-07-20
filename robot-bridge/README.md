# RoboPrompt Robot Bridge

The web app's **Robot Agent** page never talks to a Kinova arm directly — it
talks to a small HTTP bridge running on the machine next to the robot.

`bridge_stub.py` is a **simulation-only** reference implementation of that
interface. It lets you exercise the full Preview → Confirm & Run → progress →
pause/stop loop in the browser with a fake robot.

## Run the stub

```sh
pip install fastapi uvicorn
uvicorn bridge_stub:app --port 8000
```

Then open the Robot Agent page at `/prompt/agent` — the status bar shows **Robot Online** within
a few seconds (bridge URL defaults to `http://localhost:8000`; configurable in
the UI or via `NEXT_PUBLIC_ROBOT_BRIDGE_URL` at build time).

## Interface

| Endpoint | Method | Purpose |
|---|---|---|
| `/health` | GET | Liveness check |
| `/robot/state` | GET | `{online, status, currentAction, progress, error}` |
| `/camera/status` | GET | `{connected, depth}` |
| `/camera/frame` | GET | Latest camera frame (not implemented in the stub) |
| `/vision/detect` | POST | Bridge-side detection (not implemented in the stub) |
| `/task/preview` | POST | Validate a motion plan without moving |
| `/task/execute` | POST | Execute a plan (stub: simulated timer) |
| `/task/pause` | POST | Toggle pause |
| `/robot/stop` | POST | Abort immediately |

The execute payload contains both the planned steps and the generated Kortex
sequence JSON, so a real bridge can choose either representation.

## Driving a real arm (next step)

Replace `FakeRobot` with one of:

- **Kortex Python API** — create a `BaseClient` session, then either import the
  `kortexSequence` from the payload via the sequence API, or walk `steps` and
  send `ReachPose` / `SendGripperCommand` actions one by one, checking the
  action-completed notification between steps.
- **ROS 2** — publish to your arm's action server (e.g. MoveIt or
  `kortex_bringup`), mapping each step's pose and gripper value.

Keep `/robot/stop` wired to the arm's emergency abort in either case, and keep
the physical e-stop within reach — the bridge is a convenience, not a safety
device.
