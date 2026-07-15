import type Anthropic from "@anthropic-ai/sdk";
import { ASK_FORM_TOOL_NAME, GENERATE_FILES_TOOL_NAME } from "@/lib/constants";

export const ASK_FORM_TOOL: Anthropic.Tool = {
  name: ASK_FORM_TOOL_NAME,
  description:
    "Present a short form to the user instead of writing a question as prose. Use this any time you need input from the user — confirming the arm category, filling gaps, or confirming the step-4 summary.",
  input_schema: {
    type: "object",
    properties: {
      prompt: {
        type: "string",
        description: "One short sentence of context shown above the form. Never a paragraph.",
      },
      fields: {
        type: "array",
        description: "Every input field needed for this turn, batched into one call.",
        items: {
          type: "object",
          properties: {
            id: { type: "string", description: "Stable identifier for this field." },
            label: { type: "string", description: "The field's label/question." },
            type: {
              type: "string",
              enum: ["text", "select", "textarea"],
              description:
                "'select' for enumerable choices (always prefer this when concrete options exist), 'text' for short free-form answers, 'textarea' for longer ones.",
            },
            options: {
              type: "array",
              items: { type: "string" },
              description: "Choices for a 'select' field.",
            },
            placeholder: { type: "string", description: "Optional placeholder text." },
          },
          required: ["id", "label", "type"],
        },
      },
    },
    required: ["prompt", "fields"],
  },
};

export const GENERATE_FILES_TOOL: Anthropic.Tool = {
  name: GENERATE_FILES_TOOL_NAME,
  description:
    "Produce the actual code scaffold for the confirmed plan, as a set of files to package into a downloadable zip. Call this once, with every file the project needs.",
  input_schema: {
    type: "object",
    properties: {
      projectName: {
        type: "string",
        description: "A short kebab-case project folder name, e.g. 'my-arm-controller'.",
      },
      template: {
        type: "string",
        enum: ["arduino-serial", "none"],
        description:
          "'arduino-serial' when the confirmed plan is the standard Category A Arduino-over-USB-serial build: the app injects the pre-built firmware sketch and Web Serial panel, and `files` then contains ONLY the per-project files the system prompt lists (config.h, web/config.js, README.md, plus extras). 'none' for every other setup — generate the complete scaffold in `files`.",
      },
      files: {
        type: "array",
        description:
          "Every file in the scaffold — firmware/driver code, host bridge, the web control panel, a README, and config. Directory structure via '/' in path. With template 'arduino-serial', only the per-project files.",
        items: {
          type: "object",
          properties: {
            path: {
              type: "string",
              description: "Relative file path, e.g. 'firmware/arm_controller.ino' or 'web/index.html'.",
            },
            content: { type: "string", description: "The full file content." },
          },
          required: ["path", "content"],
        },
      },
      notes: {
        type: "string",
        description:
          "Short plain-text setup notes (install steps, what to fill in) — this becomes the zip's SETUP.md, not a chat reply.",
      },
    },
    required: ["projectName", "files", "notes"],
  },
};
