import { createHash, timingSafeEqual } from "node:crypto";

// Visit and click counters in Upstash Redis (free tier), via its REST API.
// Vercel's Upstash integration injects KV_REST_API_*; a direct Upstash setup
// uses UPSTASH_REDIS_REST_*. With neither set, every counter is a no-op.
// Nothing personal is stored: only numbers per day, per hospital, per kind.

export type ClickKind = "call" | "directions";

export type CounterStats = {
  connected: boolean;
  visits: Record<string, number>;
  call: Record<string, number>;
  directions: Record<string, number>;
};

const VISITS = "stats:visits";
const CLICKS: Record<ClickKind, string> = { call: "stats:clicks:call", directions: "stats:clicks:directions" };

function redis() {
  const url = (process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL || "").trim();
  const token = (process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN || "").trim();
  return url && token ? { url: url.replace(/\/+$/, ""), token } : null;
}

export function counterConnected() {
  return redis() !== null;
}

async function pipeline(commands: (string | number)[][]): Promise<unknown[] | null> {
  const db = redis();
  if (!db) return null;
  const response = await fetch(`${db.url}/pipeline`, {
    method: "POST",
    headers: { authorization: `Bearer ${db.token}`, "content-type": "application/json" },
    body: JSON.stringify(commands),
    // A stalled counter must never hold up the page or a call.
    signal: AbortSignal.timeout(4000),
  });
  if (!response.ok) throw new Error(`Counter store error ${response.status}`);
  const rows = (await response.json()) as { result?: unknown; error?: string }[];
  return rows.map((row) => {
    if (row.error) throw new Error(row.error);
    return row.result;
  });
}

/** India date, so a day's counts match the day people in Chennai saw. */
function today() {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata" }).format(new Date());
}

export async function countVisit(): Promise<number | null> {
  const result = await pipeline([
    ["HINCRBY", VISITS, "total", 1],
    ["HINCRBY", VISITS, `d:${today()}`, 1],
  ]);
  return result ? Number(result[0]) : null;
}

export async function readVisitTotal(): Promise<number | null> {
  const result = await pipeline([["HGET", VISITS, "total"]]);
  return result ? Number(result[0] ?? 0) : null;
}

export async function countClick(input: { kind: ClickKind; hospital: string; window: string; to108: boolean }) {
  const key = CLICKS[input.kind];
  const commands: (string | number)[][] = [
    ["HINCRBY", key, "total", 1],
    ["HINCRBY", key, `d:${today()}`, 1],
    ["HINCRBY", key, `h:${input.hospital}`, 1],
  ];
  if (input.kind === "call") {
    commands.push(["HINCRBY", key, `w:${input.window}`, 1]);
    if (input.to108) commands.push(["HINCRBY", key, "to108", 1]);
  }
  await pipeline(commands);
}

function hash(raw: unknown): Record<string, number> {
  const out: Record<string, number> = {};
  if (!Array.isArray(raw)) return out;
  for (let i = 0; i + 1 < raw.length; i += 2) out[String(raw[i])] = Number(raw[i + 1]) || 0;
  return out;
}

export async function readStats(): Promise<CounterStats> {
  const result = await pipeline([
    ["HGETALL", VISITS],
    ["HGETALL", CLICKS.call],
    ["HGETALL", CLICKS.directions],
  ]);
  if (!result) return { connected: false, visits: {}, call: {}, directions: {} };
  return { connected: true, visits: hash(result[0]), call: hash(result[1]), directions: hash(result[2]) };
}

/** The stats page key lives only in the STATS_KEY env var — this repo is public. */
export function statsKeyMatches(key: string | null) {
  const expected = process.env.STATS_KEY?.trim();
  if (!expected || expected.length < 24 || !key) return false;
  const digest = (value: string) => createHash("sha256").update(value).digest();
  return timingSafeEqual(digest(key), digest(expected));
}
