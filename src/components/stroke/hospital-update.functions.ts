export const HOSPITAL_UPDATE_EMAIL = "sreenivas@arunaineurocentre.com";
export const CLINIC_EMAIL = "arunaineurocentre@gmail.com";

// Web3Forms relays straight to the inbox tied to this access key — never a
// public page, no dashboard for anyone but the account owner. Access keys
// are meant to ship in client code (Web3Forms' own docs embed them in plain
// HTML forms); they only select the destination inbox. This MUST run in the
// browser, not as a server function: Web3Forms' free tier 403s any
// server-to-server call ("Use our API in client side ... Pro plan is
// required" — confirmed against the live access key), so the request has to
// come from the visitor's own browser.
const WEB3FORMS_ACCESS_KEY = "c9fca02a-c83d-4ca9-837a-bf700d5976fd";
const WEB3FORMS_ENDPOINT = "https://api.web3forms.com/submit";

const OWNERS = ["Government", "Private"] as const;
const YES_NO = ["Yes", "No"] as const;
const CATH = ["Yes", "No", "Not sure"] as const;

export type HospitalUpdate = {
  name: string;
  location: string;
  phone: string;
  ownership: (typeof OWNERS)[number];
  ct: (typeof YES_NO)[number];
  mri: (typeof YES_NO)[number];
  cathLab: (typeof CATH)[number];
  contact: string;
  note: string;
  website: string;
};

function clip(value: unknown, max: number) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

function oneOf<T extends string>(value: unknown, allowed: readonly T[]): T | null {
  return typeof value === "string" && (allowed as readonly string[]).includes(value) ? (value as T) : null;
}

export function readHospitalUpdate(data: unknown): HospitalUpdate {
  if (typeof data !== "object" || data === null) throw new Error("Missing hospital details.");
  const raw = data as Record<string, unknown>;
  const name = clip(raw.name, 160);
  const location = clip(raw.location, 240);
  const contact = clip(raw.contact, 160);
  const ownership = oneOf(raw.ownership, OWNERS);
  const ct = oneOf(raw.ct, YES_NO);
  const mri = oneOf(raw.mri, YES_NO);
  const cathLab = oneOf(raw.cathLab, CATH);
  if (name.length < 2) throw new Error("Enter the hospital name.");
  if (location.length < 2) throw new Error("Enter the hospital location.");
  if (!ownership || !ct || !mri || !cathLab) throw new Error("Choose government or private, CT, MRI, and the cath lab.");
  if (contact.length < 5) throw new Error("Enter a phone number or email so we can reply.");
  return {
    name,
    location,
    phone: clip(raw.phone, 40),
    ownership,
    ct,
    mri,
    cathLab,
    contact,
    note: clip(raw.note, 500),
    website: clip(raw.website, 200),
  };
}

export function hospitalUpdateText(update: HospitalUpdate) {
  return [
    `Hospital: ${update.name}`,
    `Location: ${update.location}`,
    `Hospital phone: ${update.phone || "—"}`,
    `Type: ${update.ownership}`,
    `CT: ${update.ct}`,
    `MRI: ${update.mri}`,
    `24-hour stroke cath lab: ${update.cathLab}`,
    `Reply to: ${update.contact}`,
    update.note ? `Note: ${update.note}` : "",
  ]
    .filter(Boolean)
    .join("\n");
}

// Primary path: Web3Forms relays the submission straight to a private inbox,
// with no dependence on the visitor's own mail client. Runs entirely in the
// browser (see the WEB3FORMS_ACCESS_KEY comment above). If it fails for any
// reason, the caller falls back to a mailto: draft to HOSPITAL_UPDATE_EMAIL.
// Neither path touches a public system.
export async function submitHospitalUpdate({ data: raw }: { data: unknown }) {
  const data = readHospitalUpdate(raw);
  if (data.website) return { via: "ignored" as const };
  const text = hospitalUpdateText(data);
  const replyto = data.contact.includes("@") ? data.contact : undefined;
  try {
    const response = await fetch(WEB3FORMS_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        access_key: WEB3FORMS_ACCESS_KEY,
        subject: `Hospital update: ${data.name}`,
        from_name: "Stroke Helpline Chennai",
        replyto,
        message: text,
      }),
      // A stalled connection here must not leave "Sending…" stuck forever —
      // time out and fall through to the mailto: fallback below.
      signal: AbortSignal.timeout(8000),
    });
    const result = (await response.json().catch(() => null)) as { success?: boolean } | null;
    if (response.ok && result?.success) return { via: "web3forms" as const };
  } catch {
    // network/Web3Forms failure — fall through to the mailto fallback.
  }
  return { via: "email" as const };
}

export async function sendOrganiserMessage(input: { subject: string; replyto: string; message: string }) {
  try {
    const response = await fetch(WEB3FORMS_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        access_key: WEB3FORMS_ACCESS_KEY,
        subject: input.subject,
        from_name: "Stroke Helpline Chennai",
        replyto: input.replyto.includes("@") ? input.replyto : undefined,
        message: input.message,
      }),
      signal: AbortSignal.timeout(8000),
    });
    const result = (await response.json().catch(() => null)) as { success?: boolean } | null;
    if (response.ok && result?.success) return { via: "web3forms" as const };
  } catch {
    // Fall through so the visitor can still send a mail draft.
  }
  return { via: "email" as const };
}

export async function copyToClinic(subject: string, message: string) {
  try {
    const body = new FormData();
    body.set("_subject", subject);
    body.set("_template", "box");
    body.set("_captcha", "false");
    body.set("message", message);
    const response = await fetch(`https://formsubmit.co/ajax/${encodeURIComponent(CLINIC_EMAIL)}`, {
      method: "POST",
      headers: { Accept: "application/json" },
      body,
      signal: AbortSignal.timeout(12000),
    });
    const result = (await response.json().catch(() => null)) as { success?: boolean | string; message?: string } | null;
    const ok = response.ok && (result?.success === true || result?.success === "true");
    return { ok, message: result?.message ?? "" };
  } catch {
    return { ok: false, message: "" };
  }
}
