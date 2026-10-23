import { createFileRoute, Link } from "@tanstack/react-router";
import { seoHead } from "@/lib/seo";

export const Route = createFileRoute("/competition")({
  head: () =>
    seoHead({
      title: "Stroke response awareness competition",
      description: "Entries for the stroke response awareness competition are now closed.",
      path: "/competition",
      noindex: true,
    }),
  component: CompetitionPage,
});

function CompetitionPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col px-4 py-6">
      <img src="/brand/arunai.png" alt="Arunai Neuro Foundation" className="h-8 w-auto max-w-[8rem]" />
      <Link to="/" className="mt-4 text-sm font-semibold text-[#1b4fad]">
        Back
      </Link>
      <h1 className="font-display mt-8 text-3xl leading-tight">Entries for the competition are now closed</h1>
      <p className="mt-3 text-sm leading-relaxed text-ink-soft">
        The final event is on 25 October 2026, 5:00–7:00 PM, at Avichi College of Arts and Science, Chennai.
      </p>
    </main>
  );
}