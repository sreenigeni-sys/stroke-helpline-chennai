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

test("urgent disclaimers and organization/contact cues cover the public site pages", async () => {
  const [publisher, publicPage, app, flow, home, directory, emergency, symptoms, treatment, recovery, branch, contact, competition] = await Promise.all([
    read("src/components/stroke/publisher-contact-cue.tsx"),
    read("src/components/stroke/public-page.tsx"),
    read("src/components/stroke/stroke-app.tsx"),
    read("src/components/stroke/flow.tsx"),
    read("src/routes/index.tsx"),
    read("src/routes/stroke-hospitals-chennai.tsx"),
    read("src/routes/stroke-emergency-chennai.tsx"),
    read("src/routes/stroke-symptoms-chennai.tsx"),
    read("src/routes/stroke-treatment-chennai.tsx"),
    read("src/routes/stroke-recovery-chennai.tsx"),
    read("src/routes/stroke-hospital-apollo-greams-road.tsx"),
    read("src/routes/contact.tsx"),
    read("src/routes/competition.tsx"),
  ]);
  assert.match(publisher, /Arunai Neuro Foundation/);
  assert.match(publisher, /hospital-published or other public sources/);
  assert.match(publisher, /not independently verified by the clinical review/);
  assert.match(publisher, /not a live confirmation of staffing, capacity, beds, or acceptance/);
  assert.match(publisher, /to="\/contact"/);
  assert.doesNotMatch(publisher, /108|112|Sreenivas|Dr\./);
  assert.match(publicPage, /urgentNotice/);
  assert.match(publicPage, /<PublisherContactCue \/>/);
  assert.match(flow, /Possible stroke\? Seek emergency medical care now\. Do not wait to finish this check\./);
  assert.match(flow, /cannot diagnose or rule out stroke/);
  assert.match(app, /showPublisherContact/);
  assert.match(app, /urgentNotice/);
  assert.match(home, /showClinicalReview showPublisherContact/);
  assert.match(directory, /For suspected stroke, seek emergency medical care now; do not wait to browse this directory\./);
  assert.match(directory, /<PublisherContactCue \/>/);
  for (const route of [emergency, symptoms, treatment, recovery, branch]) {
    assert.match(route, /urgentNotice=/);
  }
  assert.match(emergency, /Do not wait for a checklist, this page, or the hospital directory/);
  assert.match(symptoms, /even if symptoms improve/);
  assert.match(treatment, /do not delay to browse this directory/);
  assert.match(recovery, /Do not use this recovery page or directory instead of urgent care/);
  assert.match(branch, /do not delay for this listing/);
  assert.match(contact, /These forms are for non-urgent questions and corrections, not emergency response/);
  assert.match(contact, /do not wait for a reply/);
  assert.match(contact, /do not include a patient’s name or other identifying health information/);
  assert.match(contact, /<PublisherContactCue showContactLink=\{false\} \/>/);
  assert.match(competition, /Do not wait to submit an artwork entry or for a competition reply/);
  assert.match(competition, /CDC: Signs and Symptoms of Stroke/);
  assert.match(competition, /<PublisherContactCue \/>/);
  assert.match(competition, /noindex: true/);
});
