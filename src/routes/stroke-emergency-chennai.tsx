import { createFileRoute } from "@tanstack/react-router";
import { PublicPage } from "@/components/stroke/public-page";
import { seoHead } from "@/lib/seo";

const PAGE_PATH = "/stroke-emergency-chennai";
const PAGE_TITLE = "Suspected Stroke in Chennai? Find Emergency Care";
const PAGE_DESCRIPTION =
  "Use the Chennai finder to check hospital-branch stroke services, direct contacts and directions. Seek emergency care without delay.";

export const Route = createFileRoute("/stroke-emergency-chennai")({
  head: () =>
    seoHead({
      title: PAGE_TITLE,
      description: PAGE_DESCRIPTION,
      path: PAGE_PATH,
      schema: {
        "@context": "https://schema.org",
        "@type": "MedicalWebPage",
        "@id": "https://strokechennai.org/stroke-emergency-chennai#webpage",
        url: `https://strokechennai.org${PAGE_PATH}`,
        name: PAGE_TITLE,
        description: PAGE_DESCRIPTION,
        isPartOf: { "@id": "https://strokechennai.org/#website" },
        about: { "@type": "MedicalCondition", name: "Stroke" },
        inLanguage: ["en-IN", "ta-IN"],
      },
    }),
  component: EmergencyPage,
});

function EmergencyPage() {
  return (
    <PublicPage
      title="Suspected stroke in Chennai? Find a hospital branch."
      tamilTitle="பக்கவாதம் இருக்கலாம் என சந்தேகமா? மருத்துவமனை கிளையைக் கண்டறியுங்கள்."
      intro="If someone may be having a stroke, seek emergency medical care immediately. If another caregiver is present, they can check the hospital finder while you focus on the person. Follow emergency-response guidance about transport and destination."
    >
      <section>
        <h2 className="font-display text-2xl">Do this now</h2>
        <ol className="mt-3 list-decimal space-y-3 pl-6 leading-relaxed text-ink-soft">
          <li>Seek emergency medical help now. If another caregiver is present, ask them to check the hospital finder.</li>
          <li>Open the <a href="/" className="font-semibold text-[#1b4fad] underline">hospital finder</a> or ask someone nearby to check the exact branch, listed services, direct contact and directions.</li>
          <li>Tell dispatch the location and what changed suddenly. If known, tell them when the person was last at their usual baseline. If unknown, say so.</li>
          <li>Do not wait for an online checklist or for symptoms to pass. Seek urgent medical help even if symptoms improve.</li>
        </ol>
      </section>
      <section>
        <h2 className="font-display text-2xl">A static directory cannot confirm a bed</h2>
        <p className="mt-2 leading-relaxed text-ink-soft">
          Hospital service listings are not live acceptance updates. Follow emergency-response guidance and use the exact branch’s listed contact; do not assume certification or a capability listing means a hospital can accept a patient right now.
        </p>
      </section>
    </PublicPage>
  );
}
