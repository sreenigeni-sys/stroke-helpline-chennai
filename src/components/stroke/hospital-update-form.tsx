import { useState, type FormEvent } from "react";
import { cn } from "@/lib/cn";
import {
  HOSPITAL_UPDATE_EMAIL,
  hospitalUpdateText,
  submitHospitalUpdate,
  type HospitalUpdate,
} from "@/components/stroke/hospital-update.functions";

const TAP = "transition-transform duration-150 ease-out active:not-disabled:scale-[0.96]";

const EMPTY = {
  name: "",
  location: "",
  phone: "",
  ownership: "",
  ct: "",
  mri: "",
  cathLab: "",
  contact: "",
  note: "",
  website: "",
};

export function HospitalUpdateForm() {
  const [fields, setFields] = useState(EMPTY);
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState<"github" | "email" | null>(null);
  const [open, setOpen] = useState(false);

  function set<K extends keyof typeof EMPTY>(key: K, value: (typeof EMPTY)[K]) {
    setFields((current) => ({ ...current, [key]: value }));
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setSending(true);
    try {
      const payload = {
        ...fields,
        ownership: fields.ownership as HospitalUpdate["ownership"],
        ct: fields.ct as HospitalUpdate["ct"],
        mri: fields.mri as HospitalUpdate["mri"],
        cathLab: fields.cathLab as HospitalUpdate["cathLab"],
      };
      const result = await submitHospitalUpdate({ data: payload });
      if (result.via === "ignored") {
        setSent("github");
        return;
      }
      if (result.via === "email") {
        const text = hospitalUpdateText(payload);
        const href = `mailto:${HOSPITAL_UPDATE_EMAIL}?subject=${encodeURIComponent(`Hospital update: ${payload.name}`)}&body=${encodeURIComponent(text)}`;
        window.location.href = href;
      }
      setSent(result.via);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not send that. Try again.");
    } finally {
      setSending(false);
    }
  }

  if (sent) {
    return (
      <section className="mt-10 border-t border-line pt-4">
        <h2 className="text-sm font-semibold text-ink">Update received</h2>
        <p className="mt-1 text-sm text-ink-soft">
          {sent === "github"
            ? "Thank you. We will review it before the hospital list changes."
            : `Thank you. If your email app did not open, send the details to ${HOSPITAL_UPDATE_EMAIL}.`}
        </p>
      </section>
    );
  }

  return (
    <section className="mt-6">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className={cn(
          "flex min-h-12 w-full flex-col items-center justify-center rounded-full border border-line bg-surface px-3 text-ink",
          TAP,
        )}
      >
        <span className="text-sm font-semibold">Contact us to update your hospital</span>
        <span className="font-tamil text-xs font-medium text-ink-soft">மருத்துவமனை விவரத்தை அனுப்ப</span>
      </button>
      {open ? (
        <div className="mt-3">
      <p className="text-xs leading-relaxed text-ink-soft">
        Name, location, government or private, CT, MRI, and a 24-hour stroke cath lab. The list
        changes only after we review it.
      </p>
      <form className="mt-3 grid gap-3" onSubmit={onSubmit}>
        <label className="grid gap-1 text-xs font-semibold text-ink">
          Hospital name
          <input
            required
            value={fields.name}
            onChange={(event) => set("name", event.target.value)}
            className="h-11 rounded-full border border-line bg-surface px-3 text-base font-medium"
            autoComplete="organization"
          />
        </label>
        <label className="grid gap-1 text-xs font-semibold text-ink">
          Location
          <input
            required
            value={fields.location}
            placeholder="Area and address"
            onChange={(event) => set("location", event.target.value)}
            className="h-11 rounded-full border border-line bg-surface px-3 text-base font-medium"
          />
        </label>
        <label className="grid gap-1 text-xs font-semibold text-ink">
          Hospital phone
          <input
            value={fields.phone}
            inputMode="tel"
            onChange={(event) => set("phone", event.target.value)}
            className="h-11 rounded-full border border-line bg-surface px-3 text-base font-medium"
          />
        </label>
        <Choice
          label="Government or private"
          value={fields.ownership}
          options={["Government", "Private"]}
          onChange={(value) => set("ownership", value)}
        />
        <Choice label="CT" value={fields.ct} options={["Yes", "No"]} onChange={(value) => set("ct", value)} />
        <Choice label="MRI" value={fields.mri} options={["Yes", "No"]} onChange={(value) => set("mri", value)} />
        <Choice
          label="24-hour stroke cath lab"
          value={fields.cathLab}
          options={["Yes", "No", "Not sure"]}
          onChange={(value) => set("cathLab", value)}
        />
        <label className="grid gap-1 text-xs font-semibold text-ink">
          Your phone or email
          <input
            required
            value={fields.contact}
            onChange={(event) => set("contact", event.target.value)}
            className="h-11 rounded-full border border-line bg-surface px-3 text-base font-medium"
            autoComplete="tel"
          />
        </label>
        <label className="grid gap-1 text-xs font-semibold text-ink">
          Anything else
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
          className={cn(
            "h-11 rounded-full bg-[#1b4fad] text-sm font-semibold text-white disabled:opacity-60",
            TAP,
          )}
        >
          {sending ? "Sending…" : "Send hospital update"}
        </button>
      </form>
        </div>
      ) : null}
    </section>
  );
}

function Choice({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  return (
    <fieldset>
      <legend className="text-xs font-semibold text-ink">{label}</legend>
      <div className="mt-1 flex gap-2">
        {options.map((option) => (
          <button
            key={option}
            type="button"
            aria-pressed={value === option}
            onClick={() => onChange(option)}
            className={cn(
              "h-10 flex-1 rounded-full border text-xs font-semibold",
              TAP,
              value === option
                ? "border-transparent bg-[#1b4fad] text-white"
                : "border-line bg-surface text-ink",
            )}
          >
            {option}
          </button>
        ))}
      </div>
    </fieldset>
  );
}
