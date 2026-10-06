import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { test } from "node:test";

const root = new URL("../", import.meta.url);
const read = (path) => readFile(fileURLToPath(new URL(path, root)), "utf8");

test("MedicalOrganization publisher is defined once and referenced by shared page graphs", async () => {
  const seo = await read("src/lib/seo.ts");
  assert.match(seo, /"@type": "MedicalOrganization"/);
  assert.match(seo, /SITE_ORGANIZATION_SCHEMA/);
  assert.match(seo, /publisher: \{ "@id": ORGANIZATION_ID \}/);
  assert.match(seo, /function addSiteEntities/);
  assert.match(seo, /BreadcrumbList/);
});

test("directory ItemList is generated from existing branch records without service-tag mutation", async () => {
  const [schema, directory, hospitals, facts] = await Promise.all([
    read("src/lib/stroke-schema.ts"),
    read("src/routes/stroke-hospitals-chennai.tsx"),
    read("src/data/hospitals.ts"),
    read("src/data/hospital-facts.ts"),
  ]);
  assert.match(directory, /"@type": "CollectionPage"/);
  assert.match(directory, /mainEntity: hospitalListSchema\(\)/);
  assert.match(directory, /breadcrumbs:/);
  assert.match(schema, /"@type": "ItemList"/);
  assert.match(schema, /itemListElement: HOSPITALS\.map/);
  assert.match(schema, /"@type": "Hospital"/);
  assert.match(schema, /PostalAddress/);
  assert.match(schema, /GeoCoordinates/);
  assert.doesNotMatch(schema, /hospital\.(?:phone|notes|verify|tierRaw|level)/);
  assert.equal([...hospitals.matchAll(/"id": "([^"]+)"/g)].length, 42);
  assert.match(facts, /thrombectomy: comprehensive \? "yes"/);
});

test("the single branch pilot is an independent route and does not expose 108 or 112", async () => {
  const [schema, route] = await Promise.all([
    read("src/lib/stroke-schema.ts"),
    read("src/routes/stroke-hospital-apollo-greams-road.tsx"),
  ]);
  assert.match(schema, /PILOT_BRANCH_ID = "TN-PVT-001"/);
  assert.match(schema, /"@type": "Hospital"/);
  assert.match(schema, /mainEntityOfPage/);
  assert.match(route, /createFileRoute\("\/stroke-hospital-apollo-greams-road"\)/);
  assert.match(route, /PILOT_BRANCH\.address/);
  assert.match(route, /does not confirm current service, capacity/);
  assert.doesNotMatch(route, /tel:108|tel:112|Call 108|Call 112/);
});

test("the requested pages receive breadcrumb markup and the pilot is in the crawl inventories", async () => {
  const [directory, emergency, sitemap, routes] = await Promise.all([
    read("src/routes/stroke-hospitals-chennai.tsx"),
    read("src/routes/stroke-emergency-chennai.tsx"),
    read("public/sitemap.xml"),
    read("public/manus-routes.json"),
  ]);
  assert.match(directory, /breadcrumbs: \[\{ name: "Home"/);
  assert.match(emergency, /breadcrumbs: \[\{ name: "Home"/);
  assert.match(sitemap, /https:\/\/strokechennai\.org\/stroke-hospital-apollo-greams-road/);
  assert.match(routes, /"path":"\/stroke-hospital-apollo-greams-road"/);
});
