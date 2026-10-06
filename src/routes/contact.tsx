import { createFileRoute, Link } from "@tanstack/react-router";
import { HospitalUpdateForm } from "@/components/stroke/hospital-update-form";
import { ReviewForm } from "@/components/stroke/review-form";
import { seoHead } from "@/lib/seo";

export const Route = createFileRoute("/contact")({
  head: () =>
    seoHead({
      title: "Contact Stroke Helpline Chennai",
      description: "Send a correction to hospital information or contact Stroke Helpline Chennai.",
      path: "/contact",
      noindex: true,
    }),
  component: ContactPage,
});

function ContactPage() {
  return (
    <main className="mx-auto min-h-screen max-w-md px-4 py-6">
      <header className="flex items-center justify-between gap-3">
        <img src="/brand/arunai.png" alt="Arunai Neuro Foundation" className="h-8 w-auto max-w-[8rem]" />
        <Link to="/" className="text-sm font-semibold text-[#1b4fad]">
          Back
        </Link>
      </header>
      <h1 className="font-display mt-6 text-3xl leading-tight">Contact us</h1>
      <p className="font-tamil mt-1 text-base text-ink-soft">தொடர்பு கொள்ள</p>

      <section className="mt-6">
        <h2 className="text-lg font-semibold">Update a hospital</h2>
        <p className="font-tamil mt-0.5 text-sm text-ink-soft">மருத்துவமனை விவரத்தை அனுப்ப</p>
        <div className="mt-3">
          <HospitalUpdateForm />
        </div>
      </section>

      <section className="mt-10 border-t border-line pt-8">
        <h2 className="text-lg font-semibold">Leave a review</h2>
        <p className="font-tamil mt-0.5 text-sm text-ink-soft">பாராட்டு அல்லது குறை சொல்ல</p>
        <div className="mt-3">
          <ReviewForm />
        </div>
      </section>
    </main>
  );
}
