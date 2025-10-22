import { z } from "zod";

export const ZPLContentSchema = z
  .string()
  .min(1, "ZPL content must be a non-empty string")
  .refine((content) => {
    const trimmed = content.trim();
    return trimmed.startsWith("^XA") && trimmed.endsWith("^XZ");
  }, "ZPL content should start with ^XA and end with ^XZ");

export const PrintOptionsSchema = z.object({
  hostname: z.string().min(1, "Hostname is required"),
  shareName: z.string().min(1, "Share name is required"),
});

export function getHostname(): string {
  const { stdout } = Bun.spawnSync({
    cmd: ["cmd", "/c", "hostname"],
  });

  return stdout.toString().trim();
}

export function validateZPLContent(content: unknown) {
  return ZPLContentSchema.safeParse(content);
}

export function validatePrintOptions(options: unknown) {
  return PrintOptionsSchema.safeParse(options);
}
