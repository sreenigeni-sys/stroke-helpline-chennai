import { createFileRoute } from "@tanstack/react-router";
import { PublicPage } from "@/components/stroke/public-page";
import { seoHead, SITE_ORIGIN } from "@/lib/seo";

const PAGE_PATH = "/stroke-symptoms-chennai";
const PAGE_TITLE = "Stroke Symptoms in Chennai: Find Emergency Care";
const PAGE_DESCRIPTION =
  "Recognize sudden stroke warning signs and find Chennai hospitals. Do not wait for an online self-test.";

export const Route = createFileRoute("/stroke-symptoms-chennai")({
  head: () =>
    seoHead({
      title: PAGE_TITLE,
      description: PAGE_DESCRIPTION,
      path: PAGE_PATH,
      clinicallyReviewed: true,
      schema: {
        "@context": "https://schema.org",
        "@type": "MedicalWebPage",
        "@id": `${SITE_ORIGIN}${PAGE_PATH}#webpage`,
        url: `${SITE_ORIGIN}${PAGE_PATH}`,
        name: PAGE_TITLE,
        description: PAGE_DESCRIPTION,
        about: { "@type": "MedicalCondition", name: "Stroke" },
        inLanguage: ["en-IN", "ta-IN"],
      },
    }),
  component: SymptomsPage,
});

function SymptomsPage() {
  return (
    <PublicPage
      title="Sudden stroke warning signs? Find care and call for help."
      tamilTitle="பக்கவாதத்தின் திடீர் அறிகுறிகளா? உதவியை அழைத்து சிகிச்சையைத் தேடுங்கள்."
      intro="Stroke warning signs can begin suddenly. This page explains common warning signs and what to do; it is not a diagnosis."
      urgentNotice="Sudden face, arm, speech, balance, vision, or other stroke-like changes need urgent medical assessment. Seek emergency medical help now, even if symptoms improve. This page cannot diagnose or rule out stroke."
      clinicalReviewScope="This review covers warning-sign and action guidance; this page is not a diagnostic test."
    >
      <section>
        <h2 className="font-display text-2xl">Remember B.E.F.A.S.T.</h2>
        <ul className="mt-3 space-y-3 leading-relaxed text-ink-soft">
          <li><strong className="text-ink">Balance:</strong> sudden dizziness, loss of balance or difficulty walking.</li>
          <li><strong className="text-ink">Eyes:</strong> sudden trouble seeing in one or both eyes.</li>
          <li><strong className="text-ink">Face:</strong> one side droops or feels numb.</li>
          <li><strong className="text-ink">Arms:</strong> sudden weakness or numbness, especially on one side.</li>
          <li><strong className="text-ink">Speech:</strong> speech is slurred or unusual, or the person has trouble understanding.</li>
          <li><strong className="text-ink">Time:</strong> call emergency help. If another caregiver is present, they can check the hospital finder while you call.</li>
        </ul>
        <p className="mt-3 leading-relaxed text-ink-soft">
          B.E.F.A.S.T. is a memory aid, not a diagnostic test. Do not wait for every sign, finish an online checklist, or see whether a symptom passes. If symptoms improve or disappear, still seek urgent medical assessment.
        </p>
      </section>
      <section>
        <h2 className="font-display text-2xl">Tell the emergency team when they were last well</h2>
        <p className="mt-2 leading-relaxed text-ink-soft">
          If known, tell dispatch or the hospital when the person was last at their usual baseline. If unknown, say so. Do not assume it is too late to seek medical assessment.
        </p>
      </section>
      <p className="text-sm text-ink-soft">
        Source: <a className="underline" href="https://www.cdc.gov/stroke/signs-symptoms/index.html" target="_blank" rel="noreferrer">CDC: Signs and Symptoms of Stroke</a>.
      </p>
    </PublicPage>
  );
}
