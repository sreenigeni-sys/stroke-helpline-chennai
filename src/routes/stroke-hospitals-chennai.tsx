import { createFileRoute } from "@tanstack/react-router";
import { StrokeApp } from "@/components/stroke/stroke-app";
import { seoHead } from "@/lib/seo";

export const Route = createFileRoute("/stroke-hospitals-chennai")({
  head: () =>
    seoHead({
      title: "Stroke-Care Hospitals in Chennai: Find a Branch",
      description:
        "Find Chennai hospital branches with stroke-care information. Compare listed capabilities, distance, phone and directions. Call 108 for ambulance help.",
      path: "/stroke-hospitals-chennai",
      schema: {
        "@context": "https://schema.org",
        "@type": "WebPage",
        name: "Stroke-care hospitals in Chennai",
        description: "Branch-level stroke-care information and a hospital finder for Chennai.",
        url: "https://strokechennai.org/stroke-hospitals-chennai",
        isPartOf: { "@type": "WebSite", name: "Stroke Helpline Chennai", url: "https://strokechennai.org/" },
        inLanguage: ["en-IN", "ta-IN"],
      },
    }),
  component: HospitalFinderPage,
});

function HospitalFinderPage() {
  return (
    <>
      <StrokeApp />
      <article className="mx-auto max-w-3xl space-y-5 px-4 pb-10 text-ink">
        <section>
          <h2 className="font-display text-2xl">Read the branch status carefully</h2>
          <p className="mt-2 leading-relaxed text-ink-soft">
            This finder sorts by straight-line distance, not live road time. Service details are labelled as a reviewed list or public/provider information and include a list date. Neither label is an official stroke-centre certification.
          </p>
        </section>
        <section>
          <h2 className="font-display text-2xl">Capability is not live acceptance</h2>
          <p className="mt-2 leading-relaxed text-ink-soft">
            The current list does not receive live hospital capacity updates. A listed CT, MRI, stroke team or thrombectomy service does not guarantee that the service is available at this moment. Follow 108/112 dispatch guidance; do not treat a static list as an “available now” status.
          </p>
        </section>
        <section>
          <h2 className="font-display text-2xl">How formal certification works</h2>
          <p className="mt-2 leading-relaxed text-ink-soft">
            NABH and the World Stroke Organization describe Essential and Advanced Stroke Centre certification levels, with an on-site assessment and a two-year certification validity. This page does not claim that any listed Chennai branch holds that certification. A formal badge should appear only after the exact branch and current certificate are confirmed through the official verification process.
          </p>
          <p className="mt-2 text-sm text-ink-soft">
            Source: <a className="underline" href="https://nabh.co/programmes/advanced-stroke-centres-certification-programme-copy/" target="_blank" rel="noreferrer">NABH–WSO programme</a> · <a className="underline" href="https://nabh-portal-live.s3.ap-south-1.amazonaws.com/wp-content/uploads/2025/07/24064253/Stroke-Centre-Standard-1st-Edition-Septeber-2023.pdf" target="_blank" rel="noreferrer">NABH stroke-centre standard</a>.
          </p>
        </section>
      </article>
    </>
  );
}
