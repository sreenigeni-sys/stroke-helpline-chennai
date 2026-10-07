import { useState, type FormEvent } from "react";
import { cn } from "@/lib/cn";
import { copyToClinic, sendOrganiserMessage } from "@/components/stroke/hospital-update.functions";

const TAP = "transition-transform duration-150 ease-out active:not-disabled:scale-[0.96]";
const MAX_BYTES = 3 * 1024 * 1024;
const THEME = "Time is Life";
function isImageFile(file: File) {
  if (file.type.startsWith("image/")) return true;
  return /\.(jpe?g|png|webp|gif|heic|heif|bmp)$/i.test(file.name);
}

function readPreview(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Could not open that image."));
    reader.readAsDataURL(file);
  });
}
const AGE_GROUPS = [
  { value: "12–15", label: "12–15 years" },
  { value: "15–18", label: "15–18 years" },
  { value: "18+ (Open to All)", label: "18+ years (open to all)" },
] as const;

export const STROKE_PLEDGE = `I pledge to be a Stroke Champion and protect the brains of my loved ones.
I will practice brain-healthy habits every day and remember the BE-FAST signs of stroke—Balance, Eyes, Face, Arm, and Speech.
பக்கவாதத்தின் அறிகுறிகளை அறிவேன்! நொடியில் செயல்பட்டு உயிரைக் காப்பேன்! I promise to act without delay, because Time is Brain, and Time is Life!`;

const EMPTY = {
  name: "",
  ageGroup: "",
  guardian: "",
  phone: "",
  email: "",
  website: "",
};

export function CompetitionForm() {
  const [fields, setFields] = useState(EMPTY);
  const [files, setFiles] = useState<File[]>([]);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [askPledge, setAskPledge] = useState(false);
  const [sent, setSent] = useState<"web3forms" | "email" | null>(null);

  function set<K extends keyof typeof EMPTY>(key: K, value: (typeof EMPTY)[K]) {
    setFields((current) => ({ ...current, [key]: value }));
  }

  async function onFiles(list: FileList | null) {
    const file = list?.[0];
    if (!file) {
      setFiles([]);
      setPreview(null);
      return;
    }
    if (!isImageFile(file)) {
      setError("Choose one image.");
      setFiles([]);
      setPreview(null);
      return;
    }
    if (file.size > MAX_BYTES) {
      setError("The image must be under 3 MB.");
      setFiles([]);
      setPreview(null);
      return;
    }
    try {
      setPreview(await readPreview(file));
      setFiles([file]);
      setError(null);
    } catch {
      setError("This image could not be opened. Try a JPEG or PNG under 3 MB.");
      setFiles([]);
      setPreview(null);
    }
  }

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    if (!fields.ageGroup) {
      setError("Choose an age group.");
      return;
    }
    if (fields.ageGroup !== "18+ (Open to All)" && fields.guardian.trim().length < 2) {
      setError("Add a parent or guardian name for participants below 18.");
      return;
    }
    if (fields.phone.replace(/\D/g, "").length < 8) {
      setError("Enter a phone number.");
      return;
    }
    if (!fields.email.includes("@")) {
      setError("Enter an email address.");
      return;
    }
    if (files.length < 1) {
      setError("Choose one image.");
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
        if (!response.ok || !payload?.url) {
          throw new Error(payload?.error || "The picture could not be uploaded. Try a smaller image.");
        }
        urls.push(payload.url);
      }
      const saved = await fetch("/api/competition-entry", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          ...fields,
          topic: THEME,
          art: "",
          note: "",
          artwork: urls.join(" "),
        }),
        signal: AbortSignal.timeout(15000),
      });
      if (!saved.ok) {
        const payload = (await saved.json().catch(() => null)) as { error?: string } | null;
        throw new Error(payload?.error || "The entry could not be saved. Try again.");
      }
      const message = [
        "Stroke response awareness competition",
        `Name: ${fields.name.trim()}`,
        `Age group: ${fields.ageGroup}`,
        `Phone: ${fields.phone.trim()}`,
        `Email: ${fields.email.trim()}`,
        `Parent or guardian: ${fields.guardian.trim() || "—"}`,
        "Pledge: confirmed",
        "Artwork:",
        ...urls,
      ]
        .filter(Boolean)
        .join("\n");
      const [result, clinic] = await Promise.all([
        sendOrganiserMessage({
          subject: `Stroke response awareness entry: ${fields.name.trim()}`,
          replyto: fields.email.trim(),
          message,
        }),
        copyToClinic(`Stroke response awareness entry: ${fields.name.trim()}`, message),
      ]);
      if (result.via !== "web3forms" && !clinic.ok) {
        setError("Your entry is saved, but the email could not be sent just now. Please try again in a moment.");
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
        <h2 className="text-lg font-semibold text-ink">Thank you. Your entry has been uploaded.</h2>
      </section>
    );
  }

  return (
    <>
      <form className="grid gap-3" onSubmit={onSubmit}>
        <label className="grid gap-1 text-xs font-semibold text-ink">
          Participant name
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
                key={option.value}
                type="button"
                aria-pressed={fields.ageGroup === option.value}
                onClick={() => set("ageGroup", option.value)}
                className={cn(
                  "h-11 rounded-full border px-3 text-sm font-semibold",
                  TAP,
                  fields.ageGroup === option.value
                    ? "border-transparent bg-[#1b4fad] text-white"
                    : "border-line bg-surface text-ink",
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
        </fieldset>
        <label className="grid gap-1 text-xs font-semibold text-ink">
          Parent or guardian name (for below 18 years old)
          <input
            value={fields.guardian}
            onChange={(event) => set("guardian", event.target.value)}
            className="h-11 rounded-full border border-line bg-surface px-3 text-base font-medium"
            autoComplete="name"
          />
        </label>
        <label className="grid gap-1 text-xs font-semibold text-ink">
          Phone
          <input
            required
            value={fields.phone}
            onChange={(event) => set("phone", event.target.value)}
            className="h-11 rounded-full border border-line bg-surface px-3 text-base font-medium"
            inputMode="tel"
            autoComplete="tel"
          />
        </label>
        <label className="grid gap-1 text-xs font-semibold text-ink">
          Email
          <input
            required
            type="email"
            value={fields.email}
            onChange={(event) => set("email", event.target.value)}
            className="h-11 rounded-full border border-line bg-surface px-3 text-base font-medium"
            autoComplete="email"
          />
        </label>
        <label className="grid gap-1 text-xs font-semibold text-ink">
          Choose files
          <input
            type="file"
            accept="image/*,.jpg,.jpeg,.png,.webp,.heic,.heif"
            onChange={(event) => void onFiles(event.target.files)}
            className="text-sm file:mr-3 file:rounded-full file:border-0 file:bg-[#1b4fad] file:px-3 file:py-2 file:text-sm file:font-semibold file:text-white"
          />
        </label>
        {preview ? (
          <img src={preview} alt="Selected artwork" className="max-h-56 w-full rounded-card object-contain" />
        ) : null}
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
