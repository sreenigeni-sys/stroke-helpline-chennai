import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { test } from "node:test";

const root = new URL("../", import.meta.url);
const read = (path) => readFile(fileURLToPath(new URL(path, root)), "utf8");

test("preserve the existing public/clinician hospital records and service tags", async () => {
  const [hospitals, facts, copy, map] = await Promise.all([
    read("src/data/hospitals.ts"),
    read("src/data/hospital-facts.ts"),
    read("src/components/stroke/locator-copy.ts"),
    read("src/components/stroke/hospital-map.tsx"),
  ]);
  const ids = [...hospitals.matchAll(/"id": "([^"]+)"/g)].map((match) => match[1]);
  assert.equal(ids.length, 42);
  assert.equal(new Set(ids).size, 42);
  assert.match(hospitals, /tierRaw: string/);
  assert.match(hospitals, /notes: string/);
  assert.match(hospitals, /verify: string/);
  assert.match(facts, /every hospital here has 24\/7 CT/);
  assert.match(facts, /thrombectomy: comprehensive \? "yes"/);
  for (const id of ["TN-PVT-002", "TN-PVT-003", "TN-PVT-004"]) {
    const row = facts.split("\n").find((line) => line.includes(`"${id}"`));
    assert.ok(row, `missing fact row for ${id}`);
    assert.match(row, /ct: "yes"/);
    assert.match(row, /thrombectomy: "yes"/);
  }
  assert.match(copy, /24\/7 CT/);
  assert.match(copy, /24\/7 thrombectomy/);
  assert.match(map, /24\/7 CT/);
});

test("homepage opens on screening and makes the hospital finder a prominent alternative", async () => {
  const [session, app, flow] = await Promise.all([
    read("src/components/stroke/session.ts"),
    read("src/components/stroke/stroke-app.tsx"),
    read("src/components/stroke/flow.tsx"),
  ]);
  assert.match(session, /phase: "intro"/);
  assert.match(flow, /Is this a stroke\?/);
  assert.match(flow, /Find hospitals now/);
  assert.match(flow, /min-h-14 w-full[^\n]*bg-\[#1b4fad\]/);
  assert.match(app, /Check stroke warning signs/);
  assert.match(app, /CallBar/);
});

test("the third-party map is mounted only after Map is selected and the privacy notice is present", async () => {
  const locator = await read("src/components/stroke/locator.tsx");
  assert.match(locator, /view === "map" \? \([\s\S]*?<HospitalMap/);
  assert.match(locator, /copy\.mapPrivacy/);
});
