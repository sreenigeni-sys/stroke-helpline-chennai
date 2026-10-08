import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("the competition export key is never committed to this public repo", async () => {
  const [store, route] = await Promise.all([
    read("src/components/stroke/competition-store.server.ts"),
    read("src/routes/api/competition-export.ts"),
  ]);
  assert.match(store, /process\.env\.COMPETITION_EXPORT_KEY/);
  assert.match(store, /timingSafeEqual/);
  assert.doesNotMatch(store, /b7e4c1a9f3d26e80c5a14f7b2d9e6c31/);
  assert.doesNotMatch(store + route, /EXPORT_KEY\s*=\s*["'`]/);
  assert.match(route, /exportKeyMatches/);
});

test("artwork paths cannot escape the competition folder", async () => {
  const route = await read("src/routes/api/competition.ts");
  const regex = route.match(/if \(!(\/\^competition.*?\$\/)\.test\(value\)/)?.[1];
  assert.ok(regex, "safePath keeps a strict allowlist regex");
  const allow = (value) => eval(regex).test(value) && !value.includes("..");
  assert.equal(allow("competition/1791-photo-AbC123.jpg"), true);
  for (const attack of [
    "competition/%2e%2e/competition-entries.json",
    "competition/../competition-entries.json",
    "competition/a/../../activity.json",
    "competition/%2E%2E%2Factivity.json",
    "competition/..",
    "competition-entries.json",
    "competition/",
  ]) {
    assert.equal(allow(attack), false, attack);
  }
});

test("uploads are sniffed raster images and served with no-script headers", async () => {
  const route = await read("src/routes/api/competition.ts");
  assert.match(route, /sniffImageType\(bytes\)/);
  const allowed = route.match(/IMAGE_TYPES = new Set\(\[([\s\S]*?)\]\)/)?.[1];
  assert.ok(allowed, "an explicit image-type allowlist exists");
  assert.doesNotMatch(allowed, /svg/i);
  assert.match(route, /"x-content-type-options": "nosniff"/);
  assert.match(route, /sandbox/);
  assert.match(route, /IMAGE_TYPES\.has\(type\)/);
});

test("CSV export neutralises spreadsheet formulas", async () => {
  const store = await read("src/components/stroke/competition-store.server.ts");
  assert.match(store, /\/\^\[=\+\\-@\\t\\r\]\//);
});
