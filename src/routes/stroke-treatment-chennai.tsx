import { createFileRoute } from "@tanstack/react-router";
import { PublicPage } from "@/components/stroke/public-page";
import { seoHead } from "@/lib/seo";

export const Route = createFileRoute("/stroke-treatment-chennai")({
  head: () =>
    seoHead({
      title: "Stroke Treatment in Chennai: Reach Emergency Care",
      description:
        "Learn how hospital stroke-capability listings work in Chennai and use the finder to check a branch and route.",
      path: "/stroke-treatment-chennai",
    }),
  component: TreatmentPage,
});

function TreatmentPage() {
  return (
    <PublicPage
      title="Stroke treatment starts with emergency assessment."
      tamilTitle="பக்கவாத சிகிச்சை அவசர மருத்துவ மதிப்பீட்டுடன் தொடங்குகிறது."
      intro="A stroke team assesses the person’s symptoms, history and brain imaging to determine the cause and appropriate care. Do not try to determine the stroke type or choose a treatment at home."
    >
      <section>
        <h2 className="font-display text-2xl">What a hospital listing can—and cannot—tell you</h2>
        <p className="mt-2 leading-relaxed text-ink-soft">
          A branch-level capability listing can help a family understand which services a hospital reports or has had reviewed. It does not decide whether a treatment is suitable, guarantee a bed, or confirm that a team is available now. Check the exact branch and follow emergency-response instructions.
        </p>
      </section>
      <section>
        <h2 className="font-display text-2xl">Use the finder without losing time</h2>
        <p className="mt-2 leading-relaxed text-ink-soft">
          Seek emergency medical help now. If someone is with you, ask them to open the <a href="/" className="font-semibold text-[#1b4fad] underline">Chennai hospital finder</a>, check the branch and directions, and share when the person was last known to be well if that time is known.
        </p>
      </section>
    </PublicPage>
  );
}
