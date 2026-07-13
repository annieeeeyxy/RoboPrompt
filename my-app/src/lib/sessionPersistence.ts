import type { ChatMessage, FormField } from "@/types/chat";

export type PersistedForm = { toolUseId: string; prompt: string; fields: FormField[] };

export type PersistedSession = {
  v: 1;
  phase: "interview" | "plan";
  history: ChatMessage[];
  currentForm: PersistedForm | null;
  fallbackText: string | null;
  formCount: number;
  planMarkdown: string;
};

const KEY = "roboprompt_session_v1";

export function loadSession(): PersistedSession | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PersistedSession;
    if (
      parsed?.v !== 1 ||
      (parsed.phase !== "interview" && parsed.phase !== "plan") ||
      !Array.isArray(parsed.history)
    ) {
      localStorage.removeItem(KEY);
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function saveSession(session: PersistedSession): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(session));
  } catch {
    // Quota exceeded (many large photos) or storage unavailable (private
    // mode) — skip persistence rather than break the interview.
  }
}

export function clearSession(): void {
  try {
    localStorage.removeItem(KEY);
  } catch {
    // Storage unavailable — nothing to clear.
  }
}

/** Rebuild preview object URLs for the photos embedded in a restored history. */
export function previewUrlsFromHistory(history: ChatMessage[]): string[] {
  const firstUser = history.find((m) => m.role === "user");
  if (!firstUser) return [];
  const urls: string[] = [];
  for (const block of firstUser.content) {
    if (block.type !== "image") continue;
    try {
      const bytes = Uint8Array.from(atob(block.base64), (c) => c.charCodeAt(0));
      urls.push(URL.createObjectURL(new Blob([bytes], { type: block.mediaType })));
    } catch {
      // Skip a corrupt image block; the interview still works without its thumbnail.
    }
  }
  return urls;
}
