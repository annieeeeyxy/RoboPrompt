import type Anthropic from "@anthropic-ai/sdk";
import { ASK_FORM_TOOL_NAME } from "@/lib/constants";

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
