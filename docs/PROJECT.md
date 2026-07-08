# RoboPrompt — Project Document

> A smart robotics code assistant. Upload your robot, answer a few questions,
> and get safe, working control code for your exact hardware.

---

## 1. Simple Project Summary

Most people who build small robots (robotic arms, servo mechanisms, motorized
machines) struggle with the same problem: **they can build the hardware, but
writing the control code is hard.**

Generic AI tools can write code, but they guess. They don't know what motor you
have, what board you're using, or what the robot is supposed to do. The result
is code that looks right but doesn't actually run your robot — or worse, damages it.

**RoboPrompt** is a website that acts like a smart robotics assistant, not just a
code generator. The user uploads a photo, CAD file, or simple design of their
robot. The AI then:

1. Figures out what kind of robot it is and where the motors/servos are
2. Looks for similar known robots or existing SDKs to use as reference
3. Asks the user for any missing hardware details
4. Asks what the user wants the robot to do
5. Builds a clear, structured prompt from all of this
6. Generates safe control code that matches the real hardware — with pin
   definitions, safety limits, calibration steps, and comments

The key idea: **understand first, then generate.** RoboPrompt checks what it
knows, asks about what it doesn't, and only then writes code.

---

## 2. User Workflow (what the user sees)

```
Step 1  →  Upload
           Upload a photo, CAD model, or drawing of the robot.

Step 2  →  AI Analysis
           The AI describes what it sees: "This looks like a 3-joint servo
           robotic arm with a gripper." It highlights the motors/servos it found.

Step 3  →  Confirm & Fill Gaps
           The AI asks about anything it couldn't tell from the image:
           - Motor/servo model?
           - Control board? (Arduino / Raspberry Pi / ESP32 / STM32)
           - Using ROS?
           - Power system?
           - Sensors?
           - Preferred language? (Python / C++ / Arduino C)

Step 4  →  Choose the Goal
           The user picks what the robot should do:
           - Move end effector to a position
           - Follow a path
           - Open/close a gripper
           - Move joints to specific angles
           - Run an autonomous routine
           - Manual control

Step 5  →  Review Summary
           RoboPrompt shows a plain-language summary of everything it understood
           before generating anything.

Step 6  →  Get Code
           RoboPrompt generates the code with comments, safety limits, and setup
           instructions. The user can copy, download, or ask for changes.
```

---

## 3. Technical Workflow (what happens behind the scenes)

```
┌─────────────┐
│   Upload    │  Image / CAD / design file
└──────┬──────┘
       │
       ▼
┌──────────────────────┐
│  1. Perception       │  Vision model reads the image/CAD.
│     (Understand)     │  Output: robot type, joints, actuators, end effector.
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│  2. Matching         │  Search open-source robots / known kits / SDKs.
│     (Reference)      │  Output: closest match + reusable structure (if any).
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│  3. Gap Detection    │  Compare what we know vs. what we need.
│     (Ask user)       │  Output: a list of questions for missing info.
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│  4. Goal Capture     │  User selects the control goal.
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│  5. Prompt Builder   │  Combine perception + references + hardware + goal
│     (Structured)     │  into one clean, structured prompt.
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│  6. Code Generation  │  Send prompt to an AI coding model.
│     (Safe output)    │  Post-process: inject safety limits, validate.
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│  Output              │  Code + comments + safety notes + calibration steps
│                      │  + warnings for any missing hardware info.
└──────────────────────┘
```

**Key design rule:** the system never jumps straight from "image" to "code." It
always passes through understanding → gap-check → goal → structured prompt.

---

## 4. Main Features

| Feature | What it does |
|---|---|
| **Multi-format upload** | Accept photos, CAD models, or simple design files. |
| **Robot understanding** | Detect robot type, motors/servos, joints, end effectors. |
| **Reference matching** | Match against open-source robots, known kits, and SDKs. |
| **Smart questions** | Only ask for the hardware info that is actually missing. |
| **Goal selection** | Clear menu of common control goals. |
| **Structured prompt builder** | Turn all info into one clean prompt for the code model. |
| **Safe code generation** | Include pin definitions, safety limits, calibration, comments. |
| **Missing-info warnings** | Clearly flag assumptions when hardware info is incomplete. |
| **Multi-language output** | Python, C++, Arduino C, with/without ROS. |
| **Copy / download / iterate** | Easy to reuse code and request changes. |

---

## 5. AI / Robotics Research References

These are areas and projects worth reading about for background and credibility:

**Robot understanding (vision + CAD)**
- Object detection / segmentation for identifying parts (YOLO, Segment Anything)
- Vision-Language Models (VLMs) that describe images in words
- URDF (Unified Robot Description Format) — the standard way robots are described

**Robot control frameworks**
- ROS / ROS 2 (Robot Operating System) — standard robotics middleware
- MoveIt — motion planning for robotic arms
- Inverse kinematics (IK) — math for "where should each joint go to reach a point"

**Hardware ecosystems**
- Arduino, Raspberry Pi, ESP32, STM32 official libraries and examples
- Servo control (PWM), stepper/DC motor drivers
- Common kits: Dynamixel servos, LewanSoul/Hiwonder arms, etc.

**AI code generation**
- Large Language Models for code (prompt design, structured prompting)
- Retrieval-Augmented Generation (RAG) — pulling in reference code/SDK docs
- Guardrails / validation for safety-critical output

**Safety**
- Joint angle limits, speed limits, soft-start, emergency stop patterns

---

## 6. Next Steps
- More robot types and reference kits
- Real hardware testing
- Polish the presentation/demo flow
