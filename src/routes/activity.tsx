import { createFileRoute, Link } from "@tanstack/react-router";
import { listStrokeActivity, type WindowPhase } from "@/components/stroke/activity.functions";

const WINDOW_LABEL: Record<WindowPhase, string> = {
  green: "4.5-hour window",
  orange: "9-hour window",
  past: "Past 9 hours",
  unset: "Clock not set",
  future: "Time not valid",
};

export const Route = createFileRoute("/activity")({
  loader: () => listStrokeActivity(),
  component: ActivityPage,
});

function ActivityPage() {
  const activity = Route.useLoaderData();
  return (
    <main className="mx-auto min-h-screen max-w-lg px-4 py-6">
      <header className="flex items-center justify-between gap-3">
        <img src="/brand/arunai.png" alt="Arunai Neuro Foundation" className="h-8 w-auto max-w-[8rem]" />
        <Link to="/" className="text-sm font-semibold text-[#1b4fad]">
          Back
        </Link>
      </header>
      <h1 className="font-display mt-6 text-3xl">Stroke calls</h1>
      <p className="mt-1 text-sm text-ink-soft">
        Counted when someone taps Call on a hospital. Each line is that call’s treatment window.
      </p>
      <p className="mt-4 font-display text-5xl tabular-nums">{activity.total}</p>
      <ul className="mt-3 grid gap-2">
        {activity.byWindow
          .filter((row) => row.phase !== "future")
          .map((row) => (
            <li key={row.phase} className="flex items-center justify-between rounded-card border border-line bg-surface px-4 py-3">
              <span className="text-sm font-semibold">{WINDOW_LABEL[row.phase]}</span>
              <span className="font-display text-2xl tabular-nums">{row.count}</span>
            </li>
          ))}
      </ul>
      <h2 className="mt-8 text-sm font-semibold tracking-wide text-ink-soft uppercase">Each call</h2>
      {activity.calls.length === 0 ? (
        <p className="mt-2 text-sm text-ink-soft">No calls yet.</p>
      ) : (
        <ul className="mt-2 divide-y divide-line">
          {activity.calls.map((call) => (
            <li key={call.id} className="flex items-baseline justify-between gap-3 py-3">
              <div>
                <p className="text-sm font-semibold">{call.target}</p>
                <p className="text-xs text-ink-soft">{formatWhen(call.calledAt)}</p>
              </div>
              <p className="shrink-0 text-xs font-semibold text-[#1b4fad]">{WINDOW_LABEL[call.window]}</p>
            </li>
          ))}
        </ul>
      )}
      <h2 className="mt-8 text-sm font-semibold tracking-wide text-ink-soft uppercase">Reviews</h2>
      {activity.reviews.length === 0 ? (
        <p className="mt-2 text-sm text-ink-soft">No reviews yet.</p>
      ) : (
        <ul className="mt-2 grid gap-2">
          {activity.reviews.map((review) => (
            <li key={review.id} className="rounded-card border border-line bg-surface px-4 py-3">
              <p className="text-xs font-semibold tracking-wide text-ink-soft uppercase">
                {review.kind === "appreciate" ? "Appreciation" : "Report"} · {formatWhen(review.createdAt)}
              </p>
              <p className="mt-1 text-sm">{review.message}</p>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}

function formatWhen(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}
