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
  assert.match(map, /pinStyle/);
});

test("the original screening journey remains, with a prominent direct finder alternative", async () => {
  const [session, app, flow] = await Promise.all([
    read("src/components/stroke/session.ts"),
    read("src/components/stroke/stroke-app.tsx"),
    read("src/components/stroke/flow.tsx"),
  ]);
  assert.match(session, /phase: "intro"/);
  assert.match(session, /loadSession/);
  assert.match(session, /saveSession/);
  assert.match(flow, /Is this a stroke\?/);
  assert.match(flow, /Find hospitals now/);
  assert.match(flow, /min-h-14 w-full[^\n]*bg-\[#1b4fad\]/);
  assert.match(app, /"Act now"/);
  assert.match(app, /An initiative of Arunai Neuro Foundation/);
  assert.match(app, /phase: "time"/);
  assert.doesNotMatch(app, /CallBar/);
});

test("108 is directory-only for government branches; public call activity stays hidden but is stored privately", async () => {
  const [locator, map, activityRoute, activityFunctions, activityStore, api, publicPage, emergency, symptoms, treatment, home, contact] = await Promise.all([
    read("src/components/stroke/locator.tsx"),
    read("src/components/stroke/hospital-map.tsx"),
    read("src/routes/activity.tsx"),
    read("src/components/stroke/activity.functions.ts"),
    read("src/components/stroke/activity-store.server.ts"),
    read("src/routes/api/stroke-call.ts"),
    read("src/components/stroke/public-page.tsx"),
    read("src/routes/stroke-emergency-chennai.tsx"),
    read("src/routes/stroke-symptoms-chennai.tsx"),
    read("src/routes/stroke-treatment-chennai.tsx"),
    read("src/routes/index.tsx"),
    read("src/routes/contact.tsx"),
  ]);
  assert.match(locator, /hospital\.phone !== "108" \|\| hospital\.ownership === "Government"/);
  assert.match(locator, /showGovernment108 = gov && hospital\.phone !== "108"/);
  assert.match(locator, /href="tel:108"/);
  assert.match(map, /arcgisonline/);
  assert.doesNotMatch(map, /cartocdn/);
  assert.match(locator, /recordStrokeCall\(\{ data: payload \}\)/);
  assert.match(activityRoute, /throw redirect\(\{ to: "\/" \}\)/);
  assert.match(activityFunctions, /export const recordStrokeCall/);
  assert.doesNotMatch(activityFunctions, /export const listStrokeActivity/);
  assert.match(activityStore, /access:\s*"private"/);
  assert.match(api, /saveStrokeCall\(data\.window, data\.target\)/);
  assert.match(api, /status:\s*405/);
  assert.match(publicPage, /Find stroke-care hospitals/);
  assert.doesNotMatch(publicPage, /tel:108|tel:112|Call 108|Call 112/);
  assert.doesNotMatch(emergency, /108|112/);
  for (const page of [symptoms, treatment, home, contact]) assert.doesNotMatch(page, /108|112|tel:108|tel:112/);
});

test("directory and emergency pages use specific schema types linked to the stable site entity", async () => {
  const [directory, emergency] = await Promise.all([
    read("src/routes/stroke-hospitals-chennai.tsx"),
    read("src/routes/stroke-emergency-chennai.tsx"),
  ]);
  assert.match(directory, /"@type": "CollectionPage"/);
  assert.match(directory, /"@id": "https:\/\/strokechennai\.org\/stroke-hospitals-chennai#webpage"/);
  assert.match(directory, /isPartOf: \{ "@id": "https:\/\/strokechennai\.org\/#website" \}/);
  assert.match(emergency, /"@type": "MedicalWebPage"/);
  assert.match(emergency, /"@id": "https:\/\/strokechennai\.org\/stroke-emergency-chennai#webpage"/);
  assert.match(emergency, /isPartOf: \{ "@id": "https:\/\/strokechennai\.org\/#website" \}/);
  assert.match(emergency, /about: \{ "@type": "MedicalCondition", name: "Stroke" \}/);
  assert.doesNotMatch(emergency, /reviewedBy|lastReviewed/);
});

test("the hospital map stays on the page, with a privacy notice", async () => {
  const locator = await read("src/components/stroke/locator.tsx");
  assert.match(locator, /<HospitalMap[\s\S]*tall=\{view === "map"\}/);
  assert.match(locator, /copy\.mapPrivacy/);
});


test("crawlable links connect the screening app and public pages to the hospital directory", async () => {
  const [app, flow, directory, publicPage] = await Promise.all([
    read("src/components/stroke/stroke-app.tsx"),
    read("src/components/stroke/flow.tsx"),
    read("src/routes/stroke-hospitals-chennai.tsx"),
    read("src/components/stroke/public-page.tsx"),
  ]);
  assert.match(app, /<Link to="\/" aria-label="Stroke Helpline Chennai home/);
  assert.match(app, /headingLevel = "h1"/);
  assert.match(app, /<Locator\s+headingLevel=\{headingLevel\}/);
  assert.match(flow, /to="\/stroke-hospitals-chennai"/);
  assert.match(flow, /event\.preventDefault\(\);\s*onSkip\(\)/);
  assert.match(flow, /<TimeStep[\s\S]*?headingLevel=\{headingLevel\}/);
  assert.match(flow, /<SignStep[\s\S]*?headingLevel=\{headingLevel\}/);
  assert.match(flow, /function SignStep[\s\S]*?const Heading = headingLevel/);
  assert.match(flow, /function TimeStep[\s\S]*?const Heading = headingLevel/);
  assert.match(flow, /const Heading = headingLevel[\s\S]*?<Heading/);
  const locator = await read("src/components/stroke/locator.tsx");
  assert.match(locator, /headingLevel = "h1"/);
  assert.match(locator, /<Heading className=\{cn\("text-3xl leading-tight"/);
  assert.match(directory, /<StrokeApp headingLevel="h2" \/>/);
  assert.match(directory, /<h1 className="font-display text-2xl">Stroke-care hospitals in Chennai<\/h1>/);
  assert.match(publicPage, /to="\/stroke-hospitals-chennai"/);
});
