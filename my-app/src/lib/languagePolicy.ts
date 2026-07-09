export const UI_LANGUAGES = ["en", "es", "fr", "zh"] as const;

export type UiLanguage = (typeof UI_LANGUAGES)[number];

const EN_STOPWORDS = [
  "the",
  "and",
  "is",
  "are",
  "please",
  "help",
  "with",
  "for",
  "to",
  "my",
  "this",
  "that",
  "robot",
  "arm",
];

const ES_STOPWORDS = [
  "el",
  "la",
  "de",
  "que",
  "por",
  "para",
  "con",
  "hola",
  "gracias",
  "puedes",
  "ayudar",
  "brazo",
  "robotico",
  "control",
];

const FR_STOPWORDS = [
  "le",
  "la",
  "les",
  "de",
  "des",
  "pour",
  "avec",
  "bonjour",
  "merci",
  "pouvez",
  "aider",
  "bras",
  "robotique",
  "controle",
];

function countMatches(tokens: string[], words: string[]): number {
  const set = new Set(tokens);
  return words.reduce((count, word) => count + (set.has(word) ? 1 : 0), 0);
}

function detectLanguagesInText(text: string): { detected: Set<UiLanguage>; mixed: boolean } {
  const detected = new Set<UiLanguage>();

  const zhChars = (text.match(/[\u4e00-\u9fff]/g) ?? []).length;
  if (zhChars >= 2) detected.add("zh");

  const lower = text.toLowerCase();
  const latinTokens = (lower.match(/[a-z\u00c0-\u017f]+/g) ?? []).filter((t) => t.length >= 2);

  const enScore = countMatches(latinTokens, EN_STOPWORDS);
  const esScore = countMatches(latinTokens, ES_STOPWORDS);
  const frScore = countMatches(latinTokens, FR_STOPWORDS);

  const hasEsAccents = /[ñáéíóúü]/i.test(text);
  const hasFrAccents = /[àâçéèêëîïôûùüÿœæ]/i.test(text);

  if (esScore >= 2 || hasEsAccents) detected.add("es");
  if (frScore >= 2 || hasFrAccents) detected.add("fr");

  if (!detected.has("es") && !detected.has("fr") && !detected.has("zh") && enScore >= 2) {
    detected.add("en");
  }

  const mixed = detected.size > 1;
  return { detected, mixed };
}

export function resolveResponseLanguage(uiLanguage: UiLanguage, userText?: string): UiLanguage {
  if (!userText || userText.trim().length === 0) return uiLanguage;

  const { detected, mixed } = detectLanguagesInText(userText);
  if (mixed || detected.size === 0) return uiLanguage;

  const [single] = Array.from(detected);
  return single ?? uiLanguage;
}

function languageName(language: UiLanguage): string {
  switch (language) {
    case "en":
      return "English";
    case "es":
      return "Spanish";
    case "fr":
      return "French";
    case "zh":
      return "Chinese";
  }
}

export function buildLanguagePolicyInstruction(
  uiLanguage: UiLanguage,
  responseLanguage: UiLanguage
): string {
  return [
    "Language policy (must follow):",
    `- UI-selected default language: ${languageName(uiLanguage)}.`,
    `- For this turn, respond in: ${languageName(responseLanguage)}.`,
    "- If the user's latest message is mixed-language, keep using the UI-selected default language.",
  ].join("\n");
}
