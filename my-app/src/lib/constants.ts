export const MODEL_ID = "claude-sonnet-5";
export const MAX_TOKENS = 8192;
export const GENERATE_MAX_TOKENS = 32000; // multi-file code scaffolds need much more headroom than a form/plan turn
export const MAX_IMAGE_BYTES = 20 * 1024 * 1024; // 20MB raw upload cap (client compresses before this)
export const MAX_IMAGE_FILES = 6;
export const ALLOWED_IMAGE_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;
export const MAX_REFERENCE_FILES = 5;
export const MAX_REFERENCE_FILE_BYTES = 15 * 1024 * 1024; // 15MB per reference file
export const FINAL_PLAN_SENTINEL = "<<<FINAL_PLAN>>>";
export const ASK_FORM_TOOL_NAME = "ask_form";
export const GENERATE_FILES_TOOL_NAME = "generate_files";
export const EARLY_GENERATION_SIGNAL = "USER_REQUESTED_EARLY_GENERATION";
