import { createServerFn } from "@tanstack/react-start";
import { getSql } from "@/lib/db";

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

async function saveStrokeCall(window: WindowPhase, target: string) {
  const sql = await getSql();
  await sql`insert into stroke_calls (window_phase, target) values (${window}, ${target})`;
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
    const sql = await getSql();
    await sql`insert into page_reviews (kind, message) values (${data.kind}, ${data.message})`;
    return { ok: true };
  });

export const listStrokeActivity = createServerFn({ method: "GET" }).handler(async () => {
  const sql = await getSql();
  const counts = await sql<{ phase: WindowPhase; count: number }>`
    select window_phase as phase, count(*) as count
    from stroke_calls
    group by window_phase
  `;
  const calls = await sql<{ id: number; called_at: string; window_phase: WindowPhase; target: string }>`
    select id, called_at::text as called_at, window_phase, target
    from stroke_calls
    order by id desc
    limit 80
  `;
  const reviews = await sql<{ id: number; created_at: string; kind: ReviewKind; message: string }>`
    select id, created_at::text as created_at, kind, message
    from page_reviews
    order by id desc
    limit 40
  `;
  const byWindow = PHASES.map((phase) => ({
    phase,
    count: Number(counts.find((row) => row.phase === phase)?.count ?? 0),
  }));
  return {
    total: byWindow.reduce((sum, row) => sum + row.count, 0),
    byWindow,
    calls: calls.map((row) => ({
      id: Number(row.id),
      calledAt: row.called_at,
      window: row.window_phase,
      target: row.target,
    })),
    reviews: reviews.map((row) => ({
      id: Number(row.id),
      createdAt: row.created_at,
      kind: row.kind,
      message: row.message,
    })),
  } satisfies StrokeActivity;
});
