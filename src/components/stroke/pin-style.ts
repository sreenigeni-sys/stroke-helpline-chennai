import type { Ownership } from "@/data/hospitals";

/** Colors show hospital ownership only; marker size is used separately for listed capability level. */
export function pinStyle(ownership: Ownership) {
  if (ownership === "Government") return { color: "#0369a1", round: false };
  return { color: "#6d28d9", round: true };
}
