import { createServerFn } from "@tanstack/react-start";

const PHASES = ["unset", "future", "green", "orange", "past"] as const;
const KINDS = ["appreciate", "report"] as const;

export type WindowPhase = (typeof PHASES)[number];
export type ReviewKind = (typeof KINDS)[number];

export type StrokeActivity = {
  total: number;
  byWindow: { phase: WindowPhase; count: number }[];
  calls: { id: number; calledAt: string; window: WindowPhase; target: string }[];
  reviews: { id: number; createdAt: string; kind: ReviewKind; message: string }[];
};

function clip(value: unknown, max: number) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

export function readStrokeCall(data: unknown) {
  if (typeof data !== "object" || data === null) throw new Error("Missing call.");
  const raw = data as Record<string, unknown>;
  const window = raw.window;
  const target = clip(raw.target, 160);
  if (typeof window !== "string" || !PHASES.includes(window as WindowPhase)) {
    throw new Error("Unknown time window.");
  }
  if (target.length < 1) throw new Error("Missing call target.");
  return { window: window as WindowPhase, target };
}

export const recordStrokeCall = createServerFn({ method: "POST" })
  .validator(readStrokeCall)
  .handler(async ({ data }) => {
    const { saveStrokeCall } = await import("@/components/stroke/activity-store.server");
    await saveStrokeCall(data.window, data.target);
    return { ok: true };
  });

export const submitPageReview = createServerFn({ method: "POST" })
  .validator((data: unknown) => {
    if (typeof data !== "object" || data === null) throw new Error("Missing review.");
    const raw = data as Record<string, unknown>;
    const kind = raw.kind;
    const message = clip(raw.message, 500);
    const website = clip(raw.website, 200);
    if (typeof kind !== "string" || !KINDS.includes(kind as ReviewKind)) {
      throw new Error("Choose appreciate or report.");
    }
    if (message.length < 2) throw new Error("Write a short note.");
    return { kind: kind as ReviewKind, message, website };
  })
  .handler(async ({ data }) => {
    if (data.website) return { ok: true };
    const { savePageReview } = await import("@/components/stroke/activity-store.server");
    await savePageReview(data.kind, data.message);
    return { ok: true };
  });

export const listStrokeActivity = createServerFn({ method: "GET" }).handler(async () => {
  const store = await import("@/components/stroke/activity-store.server");
  return store.listStrokeActivity();
});
