export const WINDOW_45_MS = 4.5 * 60 * 60 * 1000;
export const WINDOW_9_MS = 9 * 60 * 60 * 1000;

export type ClockPhase = "unset" | "future" | "green" | "orange" | "past";

export type ClockReading = {
  phase: ClockPhase;
  elapsed: number;
  left45: number;
  left9: number;
};

export function readClock(onsetIso: string | null, now: number): ClockReading {
  if (!onsetIso) {
    return { phase: "unset", elapsed: 0, left45: WINDOW_45_MS, left9: WINDOW_9_MS };
  }
  const onset = new Date(onsetIso).getTime();
  if (Number.isNaN(onset)) {
    return { phase: "unset", elapsed: 0, left45: WINDOW_45_MS, left9: WINDOW_9_MS };
  }
  const elapsed = now - onset;
  if (elapsed < 0) {
    return { phase: "future", elapsed, left45: WINDOW_45_MS, left9: WINDOW_9_MS };
  }
  const left45 = WINDOW_45_MS - elapsed;
  const left9 = WINDOW_9_MS - elapsed;
  const phase: ClockPhase = left45 > 0 ? "green" : left9 > 0 ? "orange" : "past";
  return { phase, elapsed, left45, left9 };
}

export function formatHMS(ms: number) {
  const total = Math.max(0, Math.floor(Math.abs(ms) / 1000));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(h)}:${pad(m)}:${pad(s)}`;
}

export function fractionLeft(left: number, windowMs: number) {
  if (windowMs <= 0) return 0;
  return Math.min(1, Math.max(0, left / windowMs));
}
