import { createFileRoute } from "@tanstack/react-router";
import { PublicPage } from "@/components/stroke/public-page";
import { seoHead } from "@/lib/seo";

export const Route = createFileRoute("/stroke-emergency-chennai")({
  head: () =>
    seoHead({
      title: "Suspected Stroke in Chennai? Find Emergency Care",
      description:
        "Call 108 for ambulance help and use the Chennai finder to check hospital-branch stroke services, contacts and directions. Do not delay an emergency call.",
      path: "/stroke-emergency-chennai",
    }),
  component: EmergencyPage,
});

function EmergencyPage() {
  return (
    <PublicPage
      title="Suspected stroke in Chennai? Connect to help and find a centre."
      tamilTitle="பக்கவாதம் இருக்கலாம் என சந்தேகமா? உதவியை அழைத்து சிகிச்சை மையத்தைத் தேடுங்கள்."
      intro="If someone may be having a stroke, call 108 for ambulance help. If another caregiver is present, they can use the hospital finder while you call. If you are alone, call emergency help rather than delaying to browse. Follow dispatch guidance about transport and destination."
    >
      <section>
        <h2 className="font-display text-2xl">Do this now</h2>
        <ol className="mt-3 list-decimal space-y-3 pl-6 leading-relaxed text-ink-soft">
          <li>Call 108 for ambulance help in Tamil Nadu. Call 112 for emergency assistance through India’s national response system.</li>
          <li>Open the <a href="/" className="font-semibold text-[#1b4fad] underline">hospital finder</a> or ask someone nearby to check the exact branch, listed services, direct contact and directions.</li>
          <li>Tell dispatch the location and what changed suddenly. If known, tell them when the person was last at their usual baseline. If unknown, say so.</li>
          <li>Do not wait for an online checklist or for symptoms to pass. Seek urgent medical help even if symptoms improve.</li>
        </ol>
        <p className="mt-4 text-sm leading-relaxed text-ink-soft">
          Official information: <a className="underline" href="https://tnhsp.org/pages/view/Emergency_Ambulance_Services" target="_blank" rel="noreferrer">Tamil Nadu 108 ambulance service</a> · <a className="underline" href="https://112.gov.in/" target="_blank" rel="noreferrer">India emergency number 112</a>.
        </p>
      </section>
      <section>
        <h2 className="font-display text-2xl">A static directory cannot confirm a bed</h2>
        <p className="mt-2 leading-relaxed text-ink-soft">
          Hospital service listings are not live acceptance updates. Use 108/112 dispatch guidance and the exact branch’s listed contact; do not assume certification or a capability listing means a hospital can accept a patient right now.
        </p>
      </section>
    </PublicPage>
  );
}
