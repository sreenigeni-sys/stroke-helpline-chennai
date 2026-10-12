import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { test } from "node:test";

const root = new URL("../", import.meta.url);
const read = (path) => readFile(fileURLToPath(new URL(path, root)), "utf8");

test("the public review date is centralized and does not identify the clinician", async () => {
  const [review, seo, note] = await Promise.all([
    read("src/lib/medical-review.ts"),
    read("src/lib/seo.ts"),
    read("src/components/stroke/clinical-review-note.tsx"),
  ]);
  assert.match(review, /CLINICAL_REVIEW_DATE = "2026-10-10"/);
  assert.match(note, /Clinician verified\./);
  assert.match(note, /dateTime=\{CLINICAL_REVIEW_DATE\}/);
  assert.match(seo, /lastReviewed: CLINICAL_REVIEW_DATE/);
  assert.match(seo, /reviewedBy: ANONYMOUS_CLINICIAN_REVIEWER/);
  assert.match(review, /\{ "@type": "Person" \}/);
  assert.doesNotMatch(review, /name\s*:/);
});

test("all reviewed public medical pages declare review metadata and visible scope", async () => {
  const [home, directory, branch, symptoms, emergency, treatment, recovery, competition, publicPage, app] = await Promise.all([
    read("src/routes/index.tsx"),
    read("src/routes/stroke-hospitals-chennai.tsx"),
    read("src/routes/stroke-hospital-apollo-greams-road.tsx"),
    read("src/routes/stroke-symptoms-chennai.tsx"),
    read("src/routes/stroke-emergency-chennai.tsx"),
    read("src/routes/stroke-treatment-chennai.tsx"),
    read("src/routes/stroke-recovery-chennai.tsx"),
    read("src/routes/competition.tsx"),
    read("src/components/stroke/public-page.tsx"),
    read("src/components/stroke/stroke-app.tsx"),
  ]);
  const seo = await read("src/lib/seo.ts");
  assert.match(home, /schema: SITE_SCHEMA/);
  assert.match(seo, /"@type": "MedicalWebPage"/);
  assert.match(home, /showClinicalReview/);
  for (const route of [directory, branch, symptoms, emergency, treatment, recovery]) {
    assert.match(route, /clinicallyReviewed: true/);
  }
  for (const route of [symptoms, emergency, treatment, recovery]) {
    assert.match(route, /"@type": "MedicalWebPage"/);
    assert.match(route, /clinicalReviewScope=/);
  }
  assert.match(directory, /ClinicalReviewNote/);
  assert.match(directory, /Stroke-readiness claims are based on hospital-published information/);
  assert.match(branch, /Stroke-readiness claims are based on hospital-published information/);
  assert.match(competition, /ClinicalReviewNote/);
  assert.match(competition, /not competition rules or dates/);
  assert.match(publicPage, /ClinicalReviewNote scope=\{clinicalReviewScope\}/);
  assert.match(app, /showClinicalReview/);
});

test("medical review dates do not imply modified dates or verified live branch availability", async () => {
  const [seo, directory, branch] = await Promise.all([
    read("src/lib/seo.ts"),
    read("src/routes/stroke-hospitals-chennai.tsx"),
    read("src/routes/stroke-hospital-apollo-greams-road.tsx"),
  ]);
  assert.doesNotMatch(seo, /dateModified/);
  assert.match(directory, /not independently verified by this review/);
  assert.match(branch, /Current services, capacity and acceptance are not confirmed/);
});
