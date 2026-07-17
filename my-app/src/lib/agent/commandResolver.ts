import type { CommandResolution, DetectedObject, StructuredCommand } from "./types";

function normalize(text: string): string {
  return text.toLowerCase().trim().replace(/s$/, "");
}

/** "apple" matches "Apple", "red apple", "apples". */
export function labelMatches(target: string, label: string): boolean {
  const t = normalize(target);
  const l = normalize(label);
  return l === t || l.includes(t) || t.includes(l);
}

/** Assign numbered display ids ("Apple 1", "Apple 2") to duplicate labels. */
export function numberDuplicates(
  objects: { label: string; confidence: number; box: DetectedObject["box"] }[]
): DetectedObject[] {
  const counts = new Map<string, number>();
  for (const obj of objects) {
    const key = normalize(obj.label);
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  const seen = new Map<string, number>();
  return objects.map((obj) => {
    const key = normalize(obj.label);
    const total = counts.get(key) ?? 1;
    const n = (seen.get(key) ?? 0) + 1;
    seen.set(key, n);
    return {
      ...obj,
      id: total > 1 ? `${obj.label} ${n}` : obj.label,
    };
  });
}

/**
 * Resolve a structured command against the current detections. Never guesses:
 * a missing destination becomes a follow-up question, zero matches becomes an
 * explicit not-found message, and multiple matches force a manual choice.
 */
export function resolveCommand(
  command: StructuredCommand,
  detections: DetectedObject[]
): CommandResolution {
  if (command.action === "unsupported" || !command.object) {
    return {
      status: "ask",
      question:
        command.clarification ??
        "I can only plan pick-and-place tasks right now. What should the robot pick up, and where should it go?",
    };
  }

  const matches = detections.filter((d) => labelMatches(command.object!, d.label));
  if (matches.length === 0) {
    return {
      status: "not-found",
      message: `I could not find ${withArticle(command.object)} in the current camera view.`,
    };
  }

  if (!command.destination) {
    return {
      status: "ask",
      question: command.clarification ?? `Where should I place the ${command.object}?`,
    };
  }

  if (matches.length > 1) {
    return { status: "choose-object", candidates: matches, destinationLabel: command.destination };
  }

  return { status: "ready", object: matches[0], destinationLabel: command.destination };
}

function withArticle(noun: string): string {
  return /^[aeiou]/i.test(noun.trim()) ? `an ${noun}` : `a ${noun}`;
}
