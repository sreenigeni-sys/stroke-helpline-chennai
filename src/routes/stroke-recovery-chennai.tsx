import { createFileRoute } from "@tanstack/react-router";
import { PublicPage } from "@/components/stroke/public-page";
import { seoHead } from "@/lib/seo";

export const Route = createFileRoute("/stroke-recovery-chennai")({
  head: () =>
    seoHead({
      title: "Stroke Recovery and Rehabilitation in Chennai",
      description:
        "Explore questions to ask about stroke rehabilitation in Chennai, including movement, speech, daily activities and caregiver support.",
      path: "/stroke-recovery-chennai",
    }),
  component: RecoveryPage,
});

function RecoveryPage() {
  return (
    <PublicPage
      title="Planning recovery after a stroke"
      tamilTitle="பக்கவாதத்திற்குப் பிறகு மீட்புத் திட்டம்"
      intro="After emergency treatment, ask the treating team which rehabilitation and follow-up services are appropriate for the person. Needs differ from one survivor to another."
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
