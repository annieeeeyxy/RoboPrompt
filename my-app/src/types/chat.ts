export type ChatRole = "user" | "assistant";

export type ChatContentBlock =
  | { type: "text"; text: string }
  | {
      type: "image";
      mediaType: "image/jpeg" | "image/png" | "image/webp";
      base64: string;
    };

export type ChatMessage = {
  role: ChatRole;
  content: ChatContentBlock[];
};

export type SSEEvent =
  | { type: "delta"; text: string }
  | { type: "phase"; phase: "interview" | "plan" }
  | { type: "done"; text: string }
  | { type: "error"; message: string };

/** UI-only rendering shape — a simplified view over ChatMessage for the thread. */
export type DisplayMessage = {
  role: ChatRole;
  text: string;
  imageUrl?: string;
};
