import { createFileRoute, Link } from "@tanstack/react-router";
import { ReviewForm } from "@/components/stroke/review-form";

export const Route = createFileRoute("/review")({
  component: ReviewPage,
});

function ReviewPage() {
  return (
    <main className="mx-auto min-h-screen max-w-md px-4 py-6">
      <header className="flex items-center justify-between gap-3">
        <img src="/brand/arunai.png" alt="Arunai Neuro Foundation" className="h-8 w-auto max-w-[8rem]" />
        <Link to="/" className="text-sm font-semibold text-[#1b4fad]">
          Back
        </Link>
      </header>
      <h1 className="font-display mt-6 text-3xl leading-tight">Leave a review</h1>
      <p className="font-tamil mt-1 text-base text-ink-soft">பாராட்டு அல்லது குறை சொல்ல</p>
      <div className="mt-5">
        <ReviewForm />
      </div>
    </main>
  );
}
