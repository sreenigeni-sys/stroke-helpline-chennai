import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("counters store no personal data and keep secrets out of this public repo", async () => {
  const server = await read("src/lib/counter.server.ts");
  assert.match(server, /process\.env\.STATS_KEY/);
  assert.match(server, /timingSafeEqual/);
  assert.match(server, /KV_REST_API_URL \|\| process\.env\.UPSTASH_REDIS_REST_URL/);
  assert.doesNotMatch(server, /STATS_KEY\s*=\s*["'`]/);
  assert.doesNotMatch(server, /x-forwarded-for|x-real-ip|user-agent|remoteAddress|cookie/i);
  assert.match(server, /AbortSignal\.timeout/);
});

test("only known hospitals and click kinds can be counted", async () => {
  const click = await read("src/routes/api/click.ts");
  assert.match(click, /HOSPITAL_IDS\.has\(raw\.hospital\)/);
  assert.match(click, /KINDS\.has\(raw\.kind\)/);
  assert.match(click, /assertSameSiteRequest/);
});

test("a visit counts once per session, only beyond the home page", async () => {
  const [track, app, root] = await Promise.all([
    read("src/components/stroke/track.ts"),
    read("src/components/stroke/stroke-app.tsx"),
    read("src/routes/__root.tsx"),
  ]);
  assert.match(track, /NOT_COUNTED_PATHS = new Set\(\["\/", "\/stats"\]\)/);
  assert.match(track, /sessionStorage/);
  assert.match(app, /session\.phase !== "intro"\) countVisitOnce\(\)/);
  assert.match(root, /<VisitPing \/>/);
});

test("Call and Directions taps are counted", async () => {
  const [locator, branch] = await Promise.all([
    read("src/components/stroke/locator.tsx"),
    read("src/routes/stroke-hospital-apollo-greams-road.tsx"),
  ]);
  assert.match(locator, /trackClick\(\{ kind: "call"/);
  assert.match(locator, /trackClick\(\{ kind: "directions"/);
  assert.match(branch, /trackClick\(\{ kind: "directions"/);
});

test("the stats page is private", async () => {
  const [page, api] = await Promise.all([read("src/routes/stats.tsx"), read("src/routes/api/stats.ts")]);
  assert.match(page, /noindex: true/);
  assert.match(api, /statsKeyMatches\(request\.headers\.get\("x-stats-key"\)\)/);
});
