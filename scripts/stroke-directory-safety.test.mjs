import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { test } from "node:test";

const root = new URL("../", import.meta.url);
const read = (path) => readFile(fileURLToPath(new URL(path, root)), "utf8");

test("hospital service labels do not promise 24/7 coverage", async () => {
  const [copy, map] = await Promise.all([
    read("src/components/stroke/locator-copy.ts"),
    read("src/components/stroke/hospital-map.tsx"),
  ]);
  assert.doesNotMatch(copy, /24\/7\s+(?:CT|MRI|thrombectomy)/i);
  assert.doesNotMatch(map, /24\/7\s+(?:CT|MRI|thrombectomy)/i);
  assert.match(copy, /"CT imaging"/);
  assert.match(copy, /"Thrombectomy"/);
});

test("ambiguous Apollo branches remain unknown for CT and thrombectomy", async () => {
  const facts = await read("src/data/hospital-facts.ts");
  for (const id of ["TN-PVT-002", "TN-PVT-003", "TN-PVT-004"]) {
    const row = facts.match(new RegExp(`\\"${id}\\": \\{[^\\n]+`))?.[0];
    assert.ok(row, `missing explicit fact row for ${id}`);
    assert.match(row, /ct: "check"/);
    assert.match(row, /thrombectomy: "check"/);
  }
});

test("the third-party map is mounted only after Map is selected", async () => {
  const locator = await read("src/components/stroke/locator.tsx");
  assert.match(locator, /view === "map" \? \([\s\S]*?<HospitalMap/);
  assert.match(locator, /copy\.mapPrivacy/);
});
