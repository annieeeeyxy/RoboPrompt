import { z } from "zod";

const EnvSchema = z.object({
  ANTHROPIC_API_KEY: z.string().min(1, "ANTHROPIC_API_KEY is required"),
});

let cached: z.infer<typeof EnvSchema> | null = null;

/** Lazily validated so a missing key surfaces as a clean route error, not a crash at module load. */
export function getEnv() {
  if (!cached) {
    const result = EnvSchema.safeParse(process.env);
    if (!result.success) {
      throw new Error(result.error.issues.map((issue) => issue.message).join("; "));
    }
    cached = result.data;
  }
  return cached;
}
