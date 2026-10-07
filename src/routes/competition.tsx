import { createFileRoute, Link } from "@tanstack/react-router";
import { CompetitionForm, STROKE_PLEDGE } from "@/components/stroke/competition-form";
import { seoHead } from "@/lib/seo";

export const Route = createFileRoute("/competition")({
  head: () =>
    seoHead({
      title: "Stroke awareness competition",
      description:
        "Submit digital art or A4 paper-and-pencil art for the 25 October 2026 stroke awareness competition.",
      path: "/competition",
      noindex: true,
    }),
  component: CompetitionPage,
});

function CompetitionPage() {
  return (
    <main className="mx-auto min-h-screen max-w-md px-4 py-6">
      <header className="flex items-center justify-between gap-3">
        <img src="/brand/arunai.png" alt="Arunai Neuro Foundation" className="h-8 w-auto max-w-[8rem]" />
        <Link to="/" className="text-sm font-semibold text-[#1b4fad]">
          Back
        </Link>
      </header>
      <h1 className="font-display mt-6 text-3xl leading-tight">Stroke awareness competition</h1>
      <p className="font-tamil mt-1 text-base text-ink-soft">பக்கவாத விழிப்புணர்வு போட்டி</p>
      <p className="mt-3 text-sm font-semibold text-ink">25 October 2026</p>
      <p className="mt-2 text-sm leading-relaxed text-ink-soft">
        Raising awareness of stroke response. Open to ages 12–15, 15–18, and 18+ (open to all).
        Choose one topic: Time is brain, or BEFAST to save lives. Submit digital art, or traditional
        paper and pencil art on A4 paper. A clear photo of the paper artwork is enough.
      </p>
      <section className="mt-5 rounded-card border border-line bg-paper-deep px-4 py-4">
        <h2 className="text-sm font-semibold text-ink">Pledge</h2>
        <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-ink">{STROKE_PLEDGE}</p>
      </section>
      <section className="mt-6">
        <h2 className="text-lg font-semibold">Submission</h2>
        <div className="mt-3">
          <CompetitionForm />
        </div>
      </section>
    </main>
  );
}
