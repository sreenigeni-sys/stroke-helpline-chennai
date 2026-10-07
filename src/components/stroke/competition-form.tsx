import { useState, type FormEvent } from "react";
import { cn } from "@/lib/cn";
import { HOSPITAL_UPDATE_EMAIL, sendOrganiserMessage } from "@/components/stroke/hospital-update.functions";

const TAP = "transition-transform duration-150 ease-out active:not-disabled:scale-[0.96]";
const MAX_BYTES = 3 * 1024 * 1024;
const AGE_GROUPS = ["12–15", "15–18", "18+ (Open to All)"] as const;
const ART_TYPES = ["Digital art", "Traditional paper and pencil art, A4"] as const;

export const STROKE_PLEDGE = `I pledge to be a Stroke Champion and protect the brains of my loved ones.
I will practice brain-healthy habits every day and remember the BE-FAST signs of stroke—Balance, Eyes, Face, Arm, and Speech.
பக்கவாதத்தின் அறிகுறிகளை அறிவேன்! நொடியில் செயல்பட்டு உயிரைக் காப்பேன்! I promise to act without delay, because Time is Brain, and Time is Life!`;

const EMPTY = {
  name: "",
  ageGroup: "",
  art: "",
  guardian: "",
  contact: "",
  note: "",
  website: "",
};

export function CompetitionForm() {
  const [fields, setFields] = useState(EMPTY);
  const [files, setFiles] = useState<File[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [askPledge, setAskPledge] = useState(false);
  const [sent, setSent] = useState<"web3forms" | "email" | null>(null);

  function set<K extends keyof typeof EMPTY>(key: K, value: (typeof EMPTY)[K]) {
    setFields((current) => ({ ...current, [key]: value }));
  }

  function onFiles(list: FileList | null) {
    const next = [...(list ?? [])].slice(0, 2);
    if (next.some((file) => !file.type.startsWith("image/"))) {
      setError("Upload a photo or other image file.");
      setFiles([]);
      return;
    }
    if (next.some((file) => file.size > MAX_BYTES)) {
      setError("Each image must be under 3 MB.");
      setFiles([]);
      return;
    }
    setError(null);
    setFiles(next);
  }

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    if (!fields.ageGroup || !fields.art) {
      setError("Choose an age group and the kind of art.");
      return;
    }
    if (fields.ageGroup !== "18+ (Open to All)" && fields.guardian.trim().length < 2) {
      setError("Add a parent or guardian name for this age group.");
      return;
    }
    if (files.length < 1) {
      setError("Add a photo or image of the artwork.");
      return;
    }
    setAskPledge(true);
  }

  async function confirmPledge() {
    setAskPledge(false);
    setSending(true);
    setError(null);
    try {
      if (fields.website) {
        setSent("web3forms");
        return;
      }
      const urls: string[] = [];
      for (const file of files) {
        const body = new FormData();
        body.set("file", file);
        const response = await fetch("/api/competition", {
          method: "POST",
          body,
          signal: AbortSignal.timeout(25000),
        });
        const payload = (await response.json().catch(() => null)) as { url?: string; error?: string } | null;
        if (response.status === 503) {
          throw new Error(`Pictures cannot be uploaded right now. Email the artwork to ${HOSPITAL_UPDATE_EMAIL}.`);
        }
        if (!response.ok || !payload?.url) {
          throw new Error(payload?.error || "The picture could not be uploaded. Try a smaller image.");
        }
        urls.push(payload.url);
      }
      const message = [
        "Stroke awareness competition — 25 October 2026",
        `Name: ${fields.name.trim()}`,
        `Age group: ${fields.ageGroup}`,
        `Art: ${fields.art}`,
        `Parent or guardian: ${fields.guardian.trim() || "—"}`,
        `Reply to: ${fields.contact.trim()}`,
        fields.note.trim() ? `Note: ${fields.note.trim()}` : "",
        "Pledge: confirmed",
        "Artwork:",
        ...urls,
      ]
        .filter(Boolean)
        .join("\n");
      const result = await sendOrganiserMessage({
        subject: `Stroke awareness entry: ${fields.name.trim()}`,
        replyto: fields.contact.trim(),
        message,
      });
      if (result.via === "email") {
        const href = `mailto:${HOSPITAL_UPDATE_EMAIL}?subject=${encodeURIComponent(`Stroke awareness entry: ${fields.name.trim()}`)}&body=${encodeURIComponent(message)}`;
        window.location.href = href;
        setSent("email");
        return;
      }
      setSent("web3forms");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not send that. Try again.");
    } finally {
      setSending(false);
    }
  }

  if (sent) {
    return (
      <section className="rounded-card border border-line bg-surface px-4 py-5">
        <h2 className="text-lg font-semibold text-ink">Entry received</h2>
        <p className="mt-2 text-sm leading-relaxed text-ink-soft">
          {sent === "web3forms"
            ? "Thank you. The organisers have your entry and your artwork."
            : `Thank you. If your email app did not open, send the message to ${HOSPITAL_UPDATE_EMAIL}. The artwork links are in that message.`}
        </p>
      </section>
    );
  }

  return (
    <>
      <form className="grid gap-3" onSubmit={onSubmit}>
        <label className="grid gap-1 text-xs font-semibold text-ink">
          Your name
          <input
            required
            value={fields.name}
            onChange={(event) => set("name", event.target.value)}
            className="h-11 rounded-full border border-line bg-surface px-3 text-base font-medium"
            autoComplete="name"
          />
        </label>
        <fieldset>
          <legend className="text-xs font-semibold text-ink">Age group</legend>
          <div className="mt-1 grid gap-2">
            {AGE_GROUPS.map((option) => (
              <button
                key={option}
                type="button"
                aria-pressed={fields.ageGroup === option}
                onClick={() => set("ageGroup", option)}
                className={cn(
                  "h-11 rounded-full border px-3 text-sm font-semibold",
                  TAP,
                  fields.ageGroup === option
                    ? "border-transparent bg-[#1b4fad] text-white"
                    : "border-line bg-surface text-ink",
                )}
              >
                {option}
              </button>
            ))}
          </div>
        </fieldset>
        <fieldset>
          <legend className="text-xs font-semibold text-ink">Artwork</legend>
          <div className="mt-1 grid gap-2">
            {ART_TYPES.map((option) => (
              <button
                key={option}
                type="button"
                aria-pressed={fields.art === option}
                onClick={() => set("art", option)}
                className={cn(
                  "min-h-11 rounded-full border px-3 py-2 text-sm font-semibold",
                  TAP,
                  fields.art === option
                    ? "border-transparent bg-[#1b4fad] text-white"
                    : "border-line bg-surface text-ink",
                )}
              >
                {option}
              </button>
            ))}
          </div>
        </fieldset>
        <label className="grid gap-1 text-xs font-semibold text-ink">
          Parent or guardian name
          <span className="font-medium text-ink-soft">Needed for ages 12–15 and 15–18</span>
          <input
            value={fields.guardian}
            onChange={(event) => set("guardian", event.target.value)}
            className="h-11 rounded-full border border-line bg-surface px-3 text-base font-medium"
            autoComplete="name"
          />
        </label>
        <label className="grid gap-1 text-xs font-semibold text-ink">
          Phone or email
          <input
            required
            value={fields.contact}
            onChange={(event) => set("contact", event.target.value)}
            className="h-11 rounded-full border border-line bg-surface px-3 text-base font-medium"
            autoComplete="email"
          />
        </label>
        <label className="grid gap-1 text-xs font-semibold text-ink">
          Photo or image of the artwork
          <span className="font-medium text-ink-soft">Up to 2 images, 3 MB each. A photo of A4 paper art is fine.</span>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={(event) => onFiles(event.target.files)}
            className="text-sm file:mr-3 file:rounded-full file:border-0 file:bg-[#1b4fad] file:px-3 file:py-2 file:text-sm file:font-semibold file:text-white"
          />
        </label>
        {files.length > 0 ? (
          <p className="text-xs font-semibold text-ink-soft">{files.map((file) => file.name).join(", ")}</p>
        ) : null}
        <label className="grid gap-1 text-xs font-semibold text-ink">
          Title or note
          <input
            value={fields.note}
            onChange={(event) => set("note", event.target.value)}
            className="h-11 rounded-full border border-line bg-surface px-3 text-base font-medium"
          />
        </label>
        <label className="absolute -left-[9999px] h-0 w-0 overflow-hidden" aria-hidden="true">
          Website
          <input
            tabIndex={-1}
            autoComplete="off"
            value={fields.website}
            onChange={(event) => set("website", event.target.value)}
          />
        </label>
        {error ? (
          <p className="text-sm font-semibold text-signal" role="alert">
            {error}
          </p>
        ) : null}
        <button
          type="submit"
          disabled={sending}
          className={cn("h-12 rounded-full bg-[#1b4fad] text-sm font-semibold text-white disabled:opacity-60", TAP)}
        >
          {sending ? "Sending…" : "Submit entry"}
        </button>
      </form>
      {askPledge ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-[#0b1220]/55 p-4 sm:items-center">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="pledge-title"
            className="max-h-[90vh] w-full max-w-md overflow-auto rounded-card bg-surface px-4 py-5 shadow-card"
          >
            <h2 id="pledge-title" className="text-lg font-semibold text-ink">
              Confirm you have taken this pledge
            </h2>
            <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-ink">{STROKE_PLEDGE}</p>
            <div className="mt-4 grid gap-2">
              <button
                type="button"
                onClick={() => void confirmPledge()}
                className={cn("h-12 rounded-full bg-[#1b4fad] text-sm font-semibold text-white", TAP)}
              >
                I have taken this pledge
              </button>
              <button
                type="button"
                onClick={() => setAskPledge(false)}
                className={cn("h-11 rounded-full border border-line text-sm font-semibold text-ink", TAP)}
              >
                Go back
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
