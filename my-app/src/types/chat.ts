export type ChatRole = "user" | "assistant";

export type FormFieldType = "text" | "select" | "textarea";

export type FormField = {
  id: string;
  label: string;
  type: FormFieldType;
  options?: string[];
  placeholder?: string;
};

export type ChatContentBlock =
  | { type: "text"; text: string }
  | {
      type: "image";
      mediaType: "image/jpeg" | "image/png" | "image/webp";
      base64: string;
    }
  | { type: "tool_use"; id: string; name: string; input: unknown }
  | { type: "tool_result"; toolUseId: string; content: string };

export type ChatMessage = {
  role: ChatRole;
  content: ChatContentBlock[];
};

export type SSEEvent =
  | { type: "delta"; text: string }
  | { type: "phase"; phase: "interview" | "plan" }
  | { type: "form"; toolUseId: string; prompt: string; fields: FormField[] }
  | { type: "done"; text: string }
  | { type: "error"; message: string };
