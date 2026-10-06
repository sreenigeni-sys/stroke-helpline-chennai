import type { Level, Ownership } from "@/data/hospitals";

/** Four colours: ownership (shape) and listed capability (hue). */
export function pinStyle(level: Level, ownership: Ownership) {
  const ready = level === "comprehensive";
  const gov = ownership === "Government";
  if (ready && gov) return { color: "#15803d", round: false };
  if (ready) return { color: "#6d28d9", round: true };
  if (gov) return { color: "#0369a1", round: false };
  return { color: "#c2410c", round: true };
}
