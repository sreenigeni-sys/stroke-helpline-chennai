import { createFileRoute } from "@tanstack/react-router";
import { PublicPage } from "@/components/stroke/public-page";
import { seoHead, SITE_ORIGIN } from "@/lib/seo";

const PAGE_PATH = "/stroke-recovery-chennai";
const PAGE_TITLE = "Stroke Recovery and Rehabilitation in Chennai";
const PAGE_DESCRIPTION =
  "Explore questions to ask about stroke rehabilitation in Chennai, including movement, speech, daily activities and caregiver support.";

export const Route = createFileRoute("/stroke-recovery-chennai")({
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
  component: RecoveryPage,
});

function RecoveryPage() {
  return (
    <PublicPage
      title="Planning recovery after a stroke"
      tamilTitle="பக்கவாதத்திற்குப் பிறகு மீட்புத் திட்டம்"
      intro="This page offers general recovery discussion prompts, not an individual rehabilitation plan. Discuss needs and services with the treating team."
      urgentNotice="New or worsening stroke-like symptoms require immediate emergency assessment. Do not use this recovery page or directory instead of urgent care."
      clinicalReviewScope="This review covers general information only; rehabilitation needs should be discussed with the treating team."
    >
      <section>
        <h2 className="font-display text-2xl">Questions for the treating team</h2>
        <ul className="mt-3 list-disc space-y-2 pl-6 leading-relaxed text-ink-soft">
          <li>Which mobility, balance, daily-activity or speech services are needed?</li>
          <li>Is a swallowing or communication assessment needed?</li>
          <li>What caregiver training, equipment or home-safety changes should be planned?</li>
          <li>Who should be contacted for follow-up and changes in the person’s condition?</li>
        </ul>
      </section>
      <section>
        <h2 className="font-display text-2xl">Find service information, not endorsements</h2>
        <p className="mt-2 leading-relaxed text-ink-soft">
          A future rehabilitation directory should show the exact branch, disciplines, referral requirements, accessibility, source and last-verified date. A listing is not a recommendation or guarantee of availability.
        </p>
      </section>
    </PublicPage>
  );
}
