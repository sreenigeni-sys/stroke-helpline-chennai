import { useState, type FormEvent } from "react";
import { cn } from "@/lib/cn";
import { submitPageReview, type ReviewKind } from "@/components/stroke/activity.functions";

const TAP = "transition-transform duration-150 ease-out active:not-disabled:scale-[0.96]";

export function ReviewForm() {
  const [kind, setKind] = useState<ReviewKind | "">("");
  const [message, setMessage] = useState("");
  const [website, setWebsite] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [open, setOpen] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setSending(true);
    try {
      await submitPageReview({
        data: { kind: kind as ReviewKind, message, website },
      });
      setSent(true);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not send that. Try again.");
    } finally {
      setSending(false);
    }
  }

  if (sent) {
    return (
      <section className="mt-8 border-t border-line pt-4">
        <h2 className="text-sm font-semibold text-ink">Thank you</h2>
        <p className="mt-1 text-sm text-ink-soft">Your note is saved. It does not change the hospital list.</p>
      </section>
    );
  }

  return (
    <section className="mt-2">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className={cn(
          "flex min-h-12 w-full flex-col items-center justify-center rounded-full border border-line bg-surface px-3 text-ink",
          TAP,
        )}
      >
        <span className="text-sm font-semibold">Leave a review</span>
        <span className="font-tamil text-xs font-medium text-ink-soft">பாராட்டு அல்லது குறை சொல்ல</span>
      </button>
      {open ? (
        <div className="mt-3">
      <p className="text-xs leading-relaxed text-ink-soft">
        Appreciate the page, or report something wrong. Do not include a patient’s name.
      </p>
      <form className="mt-3 grid gap-3" onSubmit={onSubmit}>
        <div className="flex gap-2">
          {(
            [
              ["appreciate", "Appreciate"],
              ["report", "Report a problem"],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              aria-pressed={kind === id}
              onClick={() => setKind(id)}
              className={cn(
                "h-10 flex-1 rounded-full border text-xs font-semibold",
                TAP,
                kind === id ? "border-transparent bg-[#1b4fad] text-white" : "border-line bg-surface text-ink",
              )}
            >
              {label}
            </button>
          ))}
        </div>
        <label className="grid gap-1 text-xs font-semibold text-ink">
          Your note
          <textarea
            required
            value={message}
            rows={3}
            onChange={(event) => setMessage(event.target.value)}
            className="rounded-card border border-line bg-surface px-3 py-2 text-base font-medium"
          />
        </label>
        <label className="absolute -left-[9999px] h-0 w-0 overflow-hidden" aria-hidden="true">
          Website
          <input tabIndex={-1} autoComplete="off" value={website} onChange={(event) => setWebsite(event.target.value)} />
        </label>
        {error ? (
          <p className="text-sm font-semibold text-signal" role="alert">
            {error}
          </p>
        ) : null}
        <button
          type="submit"
          disabled={sending}
          className={cn(
            "h-11 rounded-full bg-[#1b4fad] text-sm font-semibold text-white disabled:opacity-60",
            TAP,
          )}
        >
          {sending ? "Sending…" : "Send review"}
        </button>
      </form>
        </div>
      ) : null}
    </section>
  );
}
