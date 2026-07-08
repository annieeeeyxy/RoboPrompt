export const MODEL_ID = "claude-sonnet-5";
export const MAX_TOKENS = 8192;
export const MAX_IMAGE_BYTES = 20 * 1024 * 1024; // 20MB raw upload cap (client compresses before this)
export const MAX_IMAGE_FILES = 6;
export const ALLOWED_IMAGE_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;
export const FINAL_PLAN_SENTINEL = "<<<FINAL_PLAN>>>";
