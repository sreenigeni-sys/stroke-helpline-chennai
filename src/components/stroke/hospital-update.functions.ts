import { createServerFn } from "@tanstack/react-start";

export const HOSPITAL_UPDATE_EMAIL = "contact@ubhcare.com";

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

export const submitHospitalUpdate = createServerFn({ method: "POST" })
  .validator(readHospitalUpdate)
  .handler(async ({ data }) => {
    if (data.website) return { via: "ignored" as const };
    const token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;
    if (!token) return { via: "email" as const };
    const response = await fetch(
      "https://api.github.com/repos/sreenigeni-sys/stroke-helpline-chennai/issues",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/vnd.github+json",
          "Content-Type": "application/json",
          "User-Agent": "stroke-helpline-chennai",
          "X-GitHub-Api-Version": "2022-11-28",
        },
        body: JSON.stringify({
          title: `Hospital update: ${data.name}`,
          body: `${hospitalUpdateText(data)}\n\nSent from the Stroke Helpline landing page. Review before changing the public list.`,
        }),
      },
    );
    if (!response.ok) return { via: "email" as const };
    return { via: "github" as const };
  });
