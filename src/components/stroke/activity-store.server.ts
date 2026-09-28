import { getSql } from "@/lib/db";
import type { ReviewKind, StrokeActivity, WindowPhase } from "@/components/stroke/activity.functions";

const PHASES = ["unset", "future", "green", "orange", "past"] as const;
const DOC = "activity.json";

type ActivityDoc = {
  calls: StrokeActivity["calls"];
  reviews: StrokeActivity["reviews"];
  totals: Record<WindowPhase, number>;
};

const EMPTY_TOTALS = Object.fromEntries(PHASES.map((phase) => [phase, 0])) as Record<WindowPhase, number>;

function useBlob() {
  const token = process.env.BLOB_READ_WRITE_TOKEN?.trim();
  const database = process.env.DATABASE_URL?.trim();
  return Boolean(token) && !database;
}

function nextId() {
  return Date.now() * 1000 + Math.floor(Math.random() * 1000);
}

// A stalled Blob request must not hang a page load or a submission forever.
const BLOB_TIMEOUT_MS = 8000;

async function readDoc(): Promise<ActivityDoc> {
  const { get } = await import("@vercel/blob");
  const result = await get(DOC, {
    access: "private",
    useCache: false,
    abortSignal: AbortSignal.timeout(BLOB_TIMEOUT_MS),
  });
  if (!result || result.statusCode !== 200 || !result.stream) {
    return { calls: [], reviews: [], totals: { ...EMPTY_TOTALS } };
  }
  try {
    const parsed = JSON.parse(await new Response(result.stream).text()) as Partial<ActivityDoc>;
    return {
      calls: Array.isArray(parsed.calls) ? parsed.calls : [],
      reviews: Array.isArray(parsed.reviews) ? parsed.reviews : [],
      totals: { ...EMPTY_TOTALS, ...(parsed.totals ?? {}) },
    };
  } catch {
    return { calls: [], reviews: [], totals: { ...EMPTY_TOTALS } };
  }
}

let writeChain: Promise<void> = Promise.resolve();

function appendBlob(kind: "calls" | "reviews", row: ActivityDoc["calls"][number] | ActivityDoc["reviews"][number]) {
  const run = writeChain.then(async () => {
    const doc = await readDoc();
    if (kind === "calls") {
      const call = row as ActivityDoc["calls"][number];
      doc.calls.unshift(call);
      doc.totals[call.window] = (doc.totals[call.window] ?? 0) + 1;
    } else doc.reviews.unshift(row as ActivityDoc["reviews"][number]);
    doc.calls = doc.calls.slice(0, 200);
    doc.reviews = doc.reviews.slice(0, 80);
    const { put } = await import("@vercel/blob");
    await put(DOC, JSON.stringify(doc), {
      access: "private",
      addRandomSuffix: false,
      allowOverwrite: true,
      contentType: "application/json",
      cacheControlMaxAge: 0,
      abortSignal: AbortSignal.timeout(BLOB_TIMEOUT_MS),
    });
  });
  writeChain = run.then(
    () => undefined,
    () => undefined,
  );
  return run;
}

export async function saveStrokeCall(window: WindowPhase, target: string) {
  if (useBlob()) {
    await appendBlob("calls", {
      id: nextId(),
      calledAt: new Date().toISOString(),
      window,
      target,
    });
    return;
  }
  const sql = await getSql();
  await sql`insert into stroke_calls (window_phase, target) values (${window}, ${target})`;
}

export async function savePageReview(kind: ReviewKind, message: string) {
  if (useBlob()) {
    await appendBlob("reviews", {
      id: nextId(),
      createdAt: new Date().toISOString(),
      kind,
      message,
    });
    return;
  }
  const sql = await getSql();
  await sql`insert into page_reviews (kind, message) values (${kind}, ${message})`;
}

export async function listStrokeActivity(): Promise<StrokeActivity> {
  if (useBlob()) {
    const doc = await readDoc();
    const calls = [...doc.calls].sort((a, b) => (a.calledAt < b.calledAt ? 1 : -1));
    const reviews = [...doc.reviews].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
    const byWindow = PHASES.map((phase) => ({
      phase,
      count: doc.totals[phase] ?? 0,
    }));
    return {
      total: byWindow.reduce((sum, row) => sum + row.count, 0),
      byWindow,
      calls: calls.slice(0, 80),
      reviews: reviews.slice(0, 40),
    };
  }
  const sql = await getSql();
  const [counts, calls, reviews] = await Promise.all([
    sql<{ phase: WindowPhase; count: number }>`
      select window_phase as phase, count(*) as count
      from stroke_calls
      group by window_phase
    `,
    sql<{ id: number; called_at: string; window_phase: WindowPhase; target: string }>`
      select id, called_at::text as called_at, window_phase, target
      from stroke_calls
      order by id desc
      limit 80
    `,
    sql<{ id: number; created_at: string; kind: ReviewKind; message: string }>`
      select id, created_at::text as created_at, kind, message
      from page_reviews
      order by id desc
      limit 40
    `,
  ]);
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
  };
}
