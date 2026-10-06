import type { Level, Ownership } from "@/data/hospitals";

/** Four colours. Squares are government, circles are private. */
export function pinStyle(level: Level, ownership: Ownership) {
  const ready = level === "comprehensive";
  const gov = ownership === "Government";
  if (ready && gov) return { color: "#0891b2", round: false };
  if (ready) return { color: "#dc2626", round: true };
  if (gov) return { color: "#15803d", round: false };
  return { color: "#1d4ed8", round: true };
}
